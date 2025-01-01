package grpcmd

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/fullstorydev/grpcurl"
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/grpcreflect"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type GrpcmdContext struct {
	_ctx       context.Context
	_cc        *grpc.ClientConn
	_refClient *grpcreflect.Client
	_refSource grpcurl.DescriptorSource

	_services              []string
	_methods               []string
	_servicesMethodsOutput strings.Builder

	_freeQueue []func()
}

func NewContext() *GrpcmdContext {
	return &GrpcmdContext{}
}

func (ctx *GrpcmdContext) deferCall(f func()) {
	ctx._freeQueue = append(ctx._freeQueue, f)
}

func (ctx *GrpcmdContext) Free() {
	for i := len(ctx._freeQueue) - 1; i >= 0; i-- {
		ctx._freeQueue[i]()
	}
}

func (ctx *GrpcmdContext) Connect(address string) error {
	var cancel context.CancelFunc
	ctx._ctx, cancel = context.WithTimeout(context.Background(), 10*time.Second)
	ctx.deferCall(cancel)

	var err error
	ctx._cc, err = grpcurl.BlockingDial(ctx._ctx, "tcp", address, nil)
	if err != nil {
		return err
	}
	ctx.deferCall(func() { ctx._cc.Close() })

	ctx._refClient = grpcreflect.NewClientAuto(ctx._ctx, ctx._cc)
	ctx.deferCall(ctx._refClient.Reset)
	ctx._refSource = grpcurl.DescriptorSourceFromServer(ctx._ctx, ctx._refClient)
	return nil
}

func (ctx *GrpcmdContext) Services() ([]string, error) {
	if ctx._services != nil {
		return ctx._services, nil
	}
	services, err := grpcurl.ListServices(ctx._refSource)
	if err != nil {
		return nil, err
	}
	ctx._services = services
	return ctx._services, nil
}

func (ctx *GrpcmdContext) Methods() ([]string, error) {
	if ctx._methods != nil {
		return ctx._methods, nil
	}
	services, err := ctx.Services()
	if err != nil {
		return nil, err
	}
	for _, s := range services {
		methods, err := grpcurl.ListMethods(ctx._refSource, s)
		if err != nil {
			return nil, err
		}
		ctx._methods = append(ctx._methods, methods...)
		ctx._servicesMethodsOutput.WriteString(s)
		ctx._servicesMethodsOutput.WriteRune('\n')
		for _, m := range methods {
			ctx._servicesMethodsOutput.WriteRune('\t')
			ctx._servicesMethodsOutput.WriteString(m[len(s)+1:])
			ctx._servicesMethodsOutput.WriteRune('\n')
		}
		ctx._servicesMethodsOutput.WriteRune('\n')
	}
	return ctx._methods, nil
}

func (ctx *GrpcmdContext) NonambiguousMethods() ([]string, error) {
	methods, err := ctx.Methods()
	if err != nil {
		return nil, err
	}

	nonambiguousMethods := make([]string, 0, len(methods))
	ambiguousMethods := make(map[string]bool)

	for _, fullyQualifiedName := range methods {
		i := strings.LastIndex(fullyQualifiedName, ".")
		var name string
		if i == -1 {
			name = fullyQualifiedName
		} else {
			name = fullyQualifiedName[i+1:]
		}
		nonambiguousMethods = append(nonambiguousMethods, name)
		if _, ok := ambiguousMethods[name]; ok {
			ambiguousMethods[name] = true
		} else {
			ambiguousMethods[name] = false
		}
	}

	for i, fullyQualifiedName := range methods {
		name := nonambiguousMethods[i]
		if ambiguousMethods[name] {
			nonambiguousMethods[i] = fullyQualifiedName
		}
	}

	return nonambiguousMethods, nil
}

func (ctx *GrpcmdContext) findFullyQualifiedMethod(method string) (string, error) {
	methods, err := ctx.Methods()
	if err != nil {
		return "", err
	}
	matches := make([]string, 0, 1)
	exactMatches := make([]string, 0, 1)
	for _, fullyQualifiedName := range methods {
		if i := strings.Index(fullyQualifiedName, method); i > -1 {
			matches = append(matches, fullyQualifiedName)
		}
		i := strings.LastIndex(fullyQualifiedName, ".")
		name := fullyQualifiedName[i+1:]
		if method == name {
			exactMatches = append(exactMatches, fullyQualifiedName)
		}
	}
	if len(matches) == 0 {
		// TODO: Consider outputting either the available methods, or the command to run to find the available methods.
		return "", errors.New("No matching method for: " + method)
	} else if len(matches) == 1 {
		return matches[0], nil
	} else if len(exactMatches) == 1 {
		return exactMatches[0], nil
	} else {
		var text strings.Builder
		text.WriteString("Ambiguous method ")
		text.WriteString(method)
		text.WriteString(". Matching methods:\n")
		for _, m := range matches {
			text.WriteString("\t\t")
			text.WriteString(m)
			text.WriteRune('\n')
		}
		return "", errors.New(text.String())
	}
}

func (ctx *GrpcmdContext) ServicesMethodsOutput() (string, error) {
	_, err := ctx.Methods()
	if err != nil {
		return "", err
	}
	return strings.TrimRight(ctx._servicesMethodsOutput.String(), "\n"), nil
}

func (ctx *GrpcmdContext) DescribeMethod(method string) (string, error) {
	fullyQualifiedMethod, err := ctx.findFullyQualifiedMethod(method)
	if err != nil {
		return "", err
	}
	var output strings.Builder
	dsc, err := ctx._refSource.FindSymbol(fullyQualifiedMethod)
	if err != nil {
		return "", err
	}
	txt, err := grpcurl.GetDescriptorText(dsc, ctx._refSource)
	if err != nil {
		return "", err
	}
	output.WriteString(txt)
	output.WriteRune('\n')
	output.WriteRune('\n')

	if d, ok := dsc.(*desc.MethodDescriptor); ok {
		txt, err = grpcurl.GetDescriptorText(d.GetInputType(), ctx._refSource)
		if err != nil {
			return "", err
		}
		output.WriteString(txt)
		output.WriteRune('\n')
		output.WriteRune('\n')
		txt, err = grpcurl.GetDescriptorText(d.GetOutputType(), ctx._refSource)
		if err != nil {
			return "", err
		}
		output.WriteString(txt)
		output.WriteRune('\n')
		output.WriteRune('\n')

		tmpl := grpcurl.MakeTemplate(d.GetInputType())
		options := grpcurl.FormatOptions{EmitJSONDefaultFields: true}
		_, formatter, err := grpcurl.RequestParserAndFormatter(grpcurl.FormatJSON, ctx._refSource, nil, options)
		if err != nil {
			return "", err
		}
		str, err := formatter(tmpl)
		if err != nil {
			return "", err
		}
		output.WriteString(d.GetInputType().GetName() + " Template:\n")
		output.WriteString(str)
	} else {
		return "", errors.New("Descriptor for " + dsc.GetFullyQualifiedName() + " is not a MethodDescriptor.")
	}
	return output.String(), nil
}

func (ctx *GrpcmdContext) Call(method, data string, headers []string) error {
	fullyQualifiedMethod, err := ctx.findFullyQualifiedMethod(method)
	if err != nil {
		return err
	}
	options := grpcurl.FormatOptions{
		EmitJSONDefaultFields: true,
		AllowUnknownFields:    false,
		IncludeTextSeparator:  false,
	}
	rp, formatter, err := grpcurl.RequestParserAndFormatter(grpcurl.FormatJSON, ctx._refSource, strings.NewReader(data), options)
	if err != nil {
		return err
	}
	h := &GrpcmdEventHandler{
		DefaultEventHandler: grpcurl.DefaultEventHandler{
			Out:            os.Stdout,
			Formatter:      formatter,
			VerbosityLevel: 0,
		},
	}
	err = grpcurl.InvokeRPC(ctx._ctx, ctx._refSource, ctx._cc, fullyQualifiedMethod, headers, h, rp.Next)
	if err != nil {
		if errStatus, ok := status.FromError(err); ok {
			h.Status = errStatus
		} else {
			return err
		}
	}
	if h.Status.Code() != codes.OK {
		formattedStatus, err := formatter(h.Status.Proto())
		if err != nil {
			return err
		}
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, formattedStatus)
		// TODO: Do we need to run all the defer functions since os.Exit doesn't?
		os.Exit(64 + int(h.Status.Code()))
	}
	return nil
}

type Result struct {
	Headers  map[string]string
	Messages []string
	Trailers map[string]string
}

func (ctx *GrpcmdContext) CallWithResult(method, data string, headers []string) (*Result, error) {
	fullyQualifiedMethod, err := ctx.findFullyQualifiedMethod(method)
	if err != nil {
		return nil, err
	}
	options := grpcurl.FormatOptions{
		EmitJSONDefaultFields: true,
		AllowUnknownFields:    false,
		IncludeTextSeparator:  false,
	}
	rp, formatter, err := grpcurl.RequestParserAndFormatter(grpcurl.FormatJSON, ctx._refSource, strings.NewReader(data), options)
	if err != nil {
		return nil, err
	}
	output := new(bytes.Buffer)
	result := &Result{
		Headers:  map[string]string{},
		Messages: []string{},
		Trailers: map[string]string{},
	}
	h := &GrpcmdResultEventHandler{
		result: result,
		DefaultEventHandler: grpcurl.DefaultEventHandler{
			Out:            output,
			Formatter:      formatter,
			VerbosityLevel: 0,
		},
	}
	err = grpcurl.InvokeRPC(ctx._ctx, ctx._refSource, ctx._cc, fullyQualifiedMethod, headers, h, rp.Next)
	if err != nil {
		if errStatus, ok := status.FromError(err); ok {
			h.Status = errStatus
		} else {
			return nil, err
		}
	}
	if h.Status.Code() != codes.OK {
		formattedStatus, err := formatter(h.Status.Proto())
		if err != nil {
			return nil, err
		}
		fmt.Fprintln(os.Stderr)
		fmt.Fprintln(os.Stderr, formattedStatus)
		// TODO: Do we need to run all the defer functions since os.Exit doesn't?
		os.Exit(64 + int(h.Status.Code()))
	}
	return result, nil
}
