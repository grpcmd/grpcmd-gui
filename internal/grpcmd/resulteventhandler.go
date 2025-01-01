package grpcmd

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/fullstorydev/grpcurl"
	"github.com/golang/protobuf/proto"
	"github.com/jhump/protoreflect/desc"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type GrpcmdResultEventHandler struct {
	result *Result
	grpcurl.DefaultEventHandler
}

func (h *GrpcmdResultEventHandler) OnResolveMethod(md *desc.MethodDescriptor) {}

func (h *GrpcmdResultEventHandler) OnSendHeaders(md metadata.MD) {}

func (h *GrpcmdResultEventHandler) OnReceiveHeaders(md metadata.MD) {
	if md.Len() > 0 {
		for k, v := range md {
			h.result.Headers[k] = strings.Join(v, ", ")
		}
	}
}

func (h *GrpcmdResultEventHandler) OnReceiveResponse(resp proto.Message) {
	h.NumResponses++
	if respStr, err := h.Formatter(resp); err != nil {
		fmt.Fprintf(h.Out, "Error while formatting response message #%d:\n\t%s\n", h.NumResponses, err)
	} else {
		h.result.Messages = append(h.result.Messages, respStr)
	}
}

func (h *GrpcmdResultEventHandler) OnReceiveTrailers(stat *status.Status, md metadata.MD) {
	h.Status = stat
	h.result.Trailers["status-code"] = strconv.Itoa(int(stat.Code()))
	if md.Len() > 0 {
		for k, v := range md {
			h.result.Trailers[k] = strings.Join(v, ", ")
		}
	}
}
