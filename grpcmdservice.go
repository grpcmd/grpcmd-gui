package main

import (
	"bufio"
	"fmt"
	"io"
	"net/http"
	"net/textproto"
	"strings"

	"github.com/grpcmd/grpcmd-gui/internal/grpcmd"
)

type GrpcmdService struct{}

func (g *GrpcmdService) CallWithResult(address string, method string, req string) grpcmd.Result {
	headers, data, err := parseHeadersAndBodyFromFullRequest(req)
	if err != nil {
		return grpcmd.Result{
			Messages: []string{err.Error()},
		}
	}
	ctx := grpcmd.NewContext()
	defer ctx.Free()
	err = ctx.Connect(address)
	if err != nil {
		return grpcmd.Result{
			Messages: []string{err.Error()},
		}
	}
	res, err := ctx.CallWithResult(method, data, headers)
	if err != nil {
		return grpcmd.Result{
			Messages: []string{err.Error()},
		}
	}
	return *res
}

func (g *GrpcmdService) NonambiguousMethods(address string) []string {
	ctx := grpcmd.NewContext()
	defer ctx.Free()
	err := ctx.Connect(address)
	if err != nil {
		return []string{err.Error()}
	}
	res, err := ctx.NonambiguousMethods()
	if err != nil {
		return []string{err.Error()}
	}
	return res
}

func (g *GrpcmdService) MethodTemplate(address, method string) string {
	ctx := grpcmd.NewContext()
	defer ctx.Free()
	err := ctx.Connect(address)
	if err != nil {
		return err.Error()
	}
	describeMethod, err := ctx.DescribeMethod(method)
	if err != nil {
		return err.Error()
	}

	i := strings.Index(describeMethod, "Template:\n")
	if i == -1 {
		return "Unable to find method template."
	}

	return describeMethod[i+10:]
}

func parseHeadersAndBodyFromFullRequest(req string) ([]string, string, error) {
	reader := bufio.NewReader(strings.NewReader("\n" + req)) // Prepend newline to avoid error when no headers in request.
	tp := textproto.NewReader(reader)
	mimeHeader, err := tp.ReadMIMEHeader()
	if err != nil {
		return nil, "", fmt.Errorf("error while parsing headers:\n\t%w", err)
	}

	httpHeaders := http.Header(mimeHeader)

	headers := []string{}
	for key, values := range httpHeaders {
		for _, v := range values {
			headers = append(headers, key+": "+v)
		}
	}

	data, err := io.ReadAll(reader)
	if err != nil {
		return nil, "", fmt.Errorf("error while reading the data:\n\t%w", err)
	}

	return headers, string(data), nil
}
