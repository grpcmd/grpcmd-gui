package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/fsnotify/fsnotify"
)

// ConfigService handles configuration file management
type ConfigService struct {
	configDir string
}

// NewConfigService creates a new instance of ConfigService
func NewConfigService() *ConfigService {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		panic("Failed to get user home directory: " + err.Error())
	}

	configDir := filepath.Join(homeDir, ".grpcmd", "config")
	if err := os.MkdirAll(configDir, 0755); err != nil {
		panic(err)
	}

	return &ConfigService{
		configDir: configDir,
	}
}

// OnConfigChange registers a callback for configuration changes
func (s *ConfigService) OnConfigChange(callback func(string)) func() {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		panic("Failed to create file watcher: " + err.Error())
	}

	if err := watcher.Add(s.configDir); err != nil {
		watcher.Close()
		panic("Failed to watch config directory: " + err.Error())
	}

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}
				if event.Has(fsnotify.Write) || event.Has(fsnotify.Create) || event.Has(fsnotify.Remove) {
					// Extract the key from the filename (remove .json extension)
					key := strings.TrimSuffix(filepath.Base(event.Name), ".json")
					callback(key)
				}
			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				fmt.Printf("Error watching config directory: %v\n", err)
			}
		}
	}()

	return func() {
		watcher.Close()
	}
}

// GetItem retrieves a value from the configuration by key
func (s *ConfigService) GetItem(key string) (string, error) {
	filePath := filepath.Join(s.configDir, key+".json")
	data, err := os.ReadFile(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			return "", errors.New("key not found")
		}
		return "", err
	}
	return string(data), nil
}

// SetItem sets a value in the configuration
func (s *ConfigService) SetItem(key string, value string) error {
	filePath := filepath.Join(s.configDir, key+".json")
	return os.WriteFile(filePath, []byte(value), 0644)
}

// RemoveItem removes a value from the configuration
func (s *ConfigService) RemoveItem(key string) error {
	filePath := filepath.Join(s.configDir, key+".json")
	if err := os.Remove(filePath); err != nil {
		if os.IsNotExist(err) {
			return nil // Key not found, consider it a success
		}
		return err
	}
	return nil
}
