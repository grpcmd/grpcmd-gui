# grpcmd-gui

[![Go Report Card](https://goreportcard.com/badge/github.com/grpcmd/grpcmd-gui)](https://goreportcard.com/report/github.com/grpcmd/grpcmd-gui)
![GitHub go.mod Go version](https://img.shields.io/github/go-mod/go-version/grpcmd/grpcmd-gui)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/grpcmd/grpcmd-gui/build.yml)
![GitHub Release](https://img.shields.io/github/v/release/grpcmd/grpcmd-gui)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads-pre/grpcmd/grpcmd-gui/total)
![GitHub Downloads (all assets, latest release)](https://img.shields.io/github/downloads-pre/grpcmd/grpcmd-gui/latest/total)

grpcmd-gui is a modern cross-platform desktop app for gRPC API development and testing.

[*(If you're looking for a gRPC CLI tool, check out: **grpcmd**)*](https://github.com/grpcmd/grpcmd)

## Demo
![Demo](./demo.png)

## Features
- Supports fetching methods from reflection and .proto files.
- Supports sending request headers.
- Supports viewing response headers and trailers.
- Supports generating a request template in JSON.
- Supports streaming request and response messages.
- Supports customization via multiple themes.
- Supports multiple requests per window session.
- Supports keyboard shortcuts (such as `Cmd/Ctrl + T` to create a new request).
- Supports collapsing the sidebar and resizing the panels.
- Supports automatic timed deletion of open requests.
- Supports persisting and live reloading workspace configuration from disk.

## Installation

### Homebrew
    brew install --cask grpcmd/tap/grpcmd-gui
The above command will install the `grpcmd-gui` package from the tap [`grpcmd/tap`](https://github.com/grpcmd/homebrew-tap).

### Binary
You can also download the binary files for macOS, Linux, and Windows from the [Releases](https://github.com/grpcmd/grpcmd-gui/releases) page.
