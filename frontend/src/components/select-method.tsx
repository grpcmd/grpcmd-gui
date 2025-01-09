import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { GrpcmdService } from '../../bindings/github.com/grpcmd/grpcmd-gui'

type SelectMethodProps = {
  address: string
  method: string
  setMethod: (method: string) => void
}

type Option = {
  value: string
  label: string
}

export default function SelectMethod({
  address,
  method,
  setMethod,
}: SelectMethodProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [options, setOptions] = useState<Option[]>([])

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
        setMethod('')
      }
    }

    fetchMethods()
  }, [address, setMethod]) // TODO: Consider using react query and storing these values in a useContext.

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="select-41"
          variant="outline"
          // biome-ignore lint/a11y/useSemanticElements: button opens a popup
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background px-3 font-normal outline-offset-0 hover:bg-background focus-visible:border-ring focus-visible:outline-[3px] focus-visible:outline-ring/20"
        >
          <span className={cn('truncate', !method && 'text-muted-foreground')}>
            {method
              ? options.find((option) => option.value === method)?.label
              : 'Select method'}
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
            <CommandGroup>
              {options.map((options) => (
                <CommandItem
                  key={options.value}
                  value={options.value}
                  onSelect={(currentValue) => {
                    setMethod(currentValue === method ? '' : currentValue)
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
