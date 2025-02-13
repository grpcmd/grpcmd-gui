package main

import (
	"github.com/fullstorydev/grpcurl"
)

type ProtoService struct{}

func (s *ProtoService) GetMethodsFromProtoFiles(protoPaths []string, protoFiles []string) ([]string, error) {
	extendedProtoPaths := getExtendedProtoPaths(protoPaths, protoFiles)

	fileSource, err := grpcurl.DescriptorSourceFromProtoFiles(
		extendedProtoPaths,
		protoFiles...,
	)
	if err != nil {
		return nil, err
	}

	services, err := grpcurl.ListServices(fileSource)
	if err != nil {
		return nil, err
	}

	result := []string{}

	for _, s := range services {
		methods, err := grpcurl.ListMethods(fileSource, s)
		if err != nil {
			return nil, err
		}
		result = append(result, methods...)
	}

	return result, nil
}
