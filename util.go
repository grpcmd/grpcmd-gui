package main

import "path/filepath"

func getExtendedProtoPaths(protoPaths []string, protoFiles []string) []string {
	result := protoPaths

	// Automatically add the directory of each proto file to the import paths to avoid:
	// 1. "must specify at least one import path if any absolute file paths are given" - from protoreflect
	// 2. The .proto file could not be found in the import paths. (If there is not a common ancestor)
	// (I'm unsure why #2 happenes since the program has the absolute path of the proto and doesn't need to search.)
	for _, protoFile := range protoFiles {
		result = append(result, filepath.Dir(protoFile))
	}

	return result
}
