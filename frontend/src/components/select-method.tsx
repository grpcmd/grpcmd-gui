import { Check, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useWindowStore } from '@/window-store'
import { Dialogs } from '@wailsio/runtime'
import {
  GrpcmdService,
  ProtoService,
} from '../../bindings/github.com/grpcmd/grpcmd-gui'

type Option = {
  value: string
  label: string
}

export default function SelectMethod() {
  const protoPaths = useWindowStore.use.protoPaths()
  const protoFiles = useWindowStore.use.protoFiles()
  const addProtoFiles = useWindowStore.use.addProtoFiles()
  const deleteProtoFiles = useWindowStore.use.deleteProtoFiles()
  const activeRequestId = useWindowStore.use.activeRequestId()
  const requests = useWindowStore.use.requests()
  // TODO: Try to get the activeRequest from the store as shallow.
  const updateActiveRequest = useWindowStore.use.updateActiveRequest()

  const activeRequest = requests[activeRequestId]
  const { address, method } = activeRequest

  const [open, setOpen] = useState<boolean>(false)
  const [options, setOptions] = useState<Option[]>([])
  const [protoFileOptions, setProtoFileOptions] = useState<{
    [protoFile: string]: Option[]
  }>({})

  useEffect(() => {
    async function fetchMethods() {
      try {
        const response = await GrpcmdService.NonambiguousMethods(address)
        setOptions(
          response.map((v) => ({
            value: v,
            label: v,
          })),
        )
      } catch {
        setOptions([])
      }
    }

    fetchMethods()
  }, [address]) // TODO: Consider using react query and storing these values in a useContext.

  const handleAddProtoFile = async () => {
    const result = (await Dialogs.OpenFile({
      AllowsMultipleSelection: true,
      Filters: [
        {
          DisplayName: 'Protocol Buffer Files',
          Pattern: '*.proto',
        },
      ],
      CanChooseDirectories: false,
      CanChooseFiles: true,
      ButtonText: 'Add',
    })) as string[] | null
    if (result === null || result.length === 0) {
      return
    }

    addProtoFiles(result)
  }

  const handleDeleteProtoFile = (protoFile: string) => {
    deleteProtoFiles([protoFile])
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: Refresh on activeRequest change to keep up to date; Don't refresh on protoFileOptions to prevent infinte loop.
  useEffect(() => {
    async function fetchMethodsFromProtoFiles() {
      // TODO: Fire these request in parallel.
      for (const protoFile of protoFiles) {
        try {
          const response = await ProtoService.GetMethodsFromProtoFiles(
            protoPaths,
            [protoFile],
          )
          setProtoFileOptions({
            ...protoFileOptions,
            [protoFile]: response.map((v) => ({
              value: v,
              label: v,
            })),
          })
        } catch {}
      }
    }

    setProtoFileOptions({})
    fetchMethodsFromProtoFiles()
  }, [activeRequest, protoFiles, protoPaths]) // TODO: Consider providing a refresh button in the UI and removing activeRequest from here.

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="input-method"
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: button opens a popup
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
        >
          <span
            className={cn('truncate', !method && 'text-muted-foreground')}
            style={{ direction: 'rtl' }}
          >
            {method ? method : 'Select method'}
          </span>
          <ChevronDown
            size={16}
            strokeWidth={2}
            className="shrink-0 text-muted-foreground/80"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-[var(--radix-popper-anchor-width)] border-input p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search methods..." />
          <CommandList>
            <CommandEmpty>No methods found.</CommandEmpty>
            <CommandGroup heading="Reflection">
              {/* TODO: Show error on hover of heading, instead of as an option. */}
              {options.map((options) => (
                <CommandItem
                  key={`Reflection${options.value}`}
                  value={options.value}
                  onSelect={(currentValue) => {
                    updateActiveRequest({
                      method: currentValue === method ? '' : currentValue,
                      methodSource: currentValue === method ? '' : '',
                    })
                    setOpen(false)
                  }}
                >
                  {options.label}
                  {method === options.value && (
                    <Check size={16} strokeWidth={2} className="ml-auto" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {protoFiles.map((protoFile) => {
              return (
                <Fragment key={protoFile}>
                  <CommandSeparator />
                  <CommandGroup>
                    {/* Custom Heading */}
                    <div
                      cmdk-group-heading="true"
                      className="flex items-center justify-between"
                    >
                      {protoFile.substring(protoFile.lastIndexOf('/') + 1)}
                      <Button
                        variant="ghost"
                        // className mostly copied from the classes on the plus button for New Request.
                        className="h-[20px] aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 after:absolute after:-inset-2 after:md:hidden group-data-[collapsible=icon]:hidden"
                        size="icon"
                        aria-label="Delete"
                        aria-hidden="true"
                        onClick={() => handleDeleteProtoFile(protoFile)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    {protoFileOptions[protoFile] ? (
                      protoFileOptions[protoFile].map((options) => (
                        <CommandItem
                          key={protoFile + options.value}
                          value={options.value}
                          onSelect={(currentValue) => {
                            updateActiveRequest({
                              method:
                                currentValue === method ? '' : currentValue,
                              methodSource:
                                currentValue === method ? '' : protoFile,
                            })
                            setOpen(false)
                          }}
                        >
                          {options.label}
                          {method === options.value && (
                            <Check
                              size={16}
                              strokeWidth={2}
                              className="ml-auto"
                            />
                          )}
                        </CommandItem>
                      ))
                    ) : (
                      <CommandEmpty>No methods found.</CommandEmpty>
                    )}
                  </CommandGroup>
                </Fragment>
              )
            })}
            <CommandSeparator />
            <CommandGroup>
              <Button
                variant="ghost"
                className="w-full justify-start font-normal"
                onClick={handleAddProtoFile}
              >
                <Plus
                  size={16}
                  strokeWidth={2}
                  className="-ms-2 me-2 opacity-60"
                  aria-hidden="true"
                />
                Import from a .proto file
              </Button>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
