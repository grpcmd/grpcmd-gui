import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/lib/utils'
import { useWindowStore } from '@/window-store'
import Editor from '@monaco-editor/react'
import { WML } from '@wailsio/runtime'
import { Bug, Lightbulb, NotepadTextDashed } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import { GrpcmdService } from '../../bindings/github.com/grpcmd/grpcmd-gui'
import SelectMethod from './select-method'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export default function HttpClient() {
  const { activeRequestId, requests, updateActiveRequest } = useWindowStore()

  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')

  const { address, method, request, response } = requests[activeRequestId]
  const setAddress = (address: string) => updateActiveRequest({ address })
  const setMethod = (method: string) => updateActiveRequest({ method })
  const setRequest = (request: string) => updateActiveRequest({ request })
  const setResponse = (response: string) => updateActiveRequest({ response })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const generateTemplate = async () => {
    if (method.trim().length === 0) {
      setRequest('Please select a method first.')
      return
    }
    try {
      const res = await GrpcmdService.MethodTemplate(address, method)
      setRequest(res)
    } catch (error) {
      setRequest(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async () => {
    if (method.trim().length === 0) {
      setResponse('Please select a method first.')
      return
    }
    setLoading(true)
    try {
      const res = await GrpcmdService.CallWithResult(address, method, request)
      let result = ''
      for (const k in res.Headers) {
        result += `${k}: ${res.Headers[k]}\n`
      }
      result += '\n'
      for (const message of res.Messages) {
        result += message
        result += '\n\n'
      }
      for (const k in res.Trailers) {
        result += `${k}: ${res.Trailers[k]}\n`
      }
      setResponse(result)
    } catch (error) {
      setResponse(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    WML.Reload()
  }, [])

  const reqPanelRef = useRef<ImperativePanelHandle>(null)

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="h-screen" ref={reqPanelRef}>
        <div
          className="grid grid-cols-1 grid-rows-[min-content_min-content_min-content_minmax(0,_1fr)_min-content] p-4 space-y-4 h-full"
          key="olk-CAhW"
        >
          <h2 className="text-xl font-bold text-right">Request</h2>
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck="false"
            />
          </div>

          <div
            className="grid grid-cols-[minmax(0,_1fr)_min-content] space-x-2 overflow-hidden"
            key="olk-Xmrs"
          >
            <SelectMethod
              address={address}
              method={method}
              setMethod={setMethod}
            />
            <Button onClick={sendRequest} disabled={loading} key="olk-iaDU">
              Send Request
            </Button>
          </div>

          <Editor
            height="100%"
            language="json"
            value={request}
            onChange={(v) => setRequest(v ?? '')}
            options={{
              minimap: {
                enabled: false,
              },
              wordWrap: 'on',
              scrollBeyondLastLine: false, // removes unnecesary scrollbar
              theme: theme === 'light' ? 'vs' : 'vs-dark',
              tabSize: 2,
            }}
            className="mb-4"
          />
          <div>
            <Button variant="outline" onClick={generateTemplate}>
              <NotepadTextDashed
                className="-ms-1 me-2"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              Generate Request Template
            </Button>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle onDoubleClick={() => reqPanelRef.current?.resize(50)} />
      <ResizablePanel className="h-screen">
        <div className="grid grid-cols-1 grid-rows-[min-content_minmax(0,_1fr)] p-4 h-full">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Response</h2>
            <div className="flex space-x-2">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Suggest a feature"
                      wml-openurl="https://grpcmd.featurebase.app"
                    >
                      <Lightbulb size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Suggest a feature
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Report a bug"
                      wml-openurl="https://github.com/grpcmd/grpcmd-gui/issues"
                    >
                      <Bug size={16} strokeWidth={2} aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="px-2 py-1 text-xs">
                    Report a bug
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Select value={theme} onValueChange={(v) => setTheme(v)}>
                <SelectTrigger className="w-[90px]">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Theme</SelectLabel>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Editor
            height="100%"
            language="json"
            value={response}
            options={{
              minimap: {
                enabled: false,
              },
              readOnly: true,
              wordWrap: 'on',
              scrollBeyondLastLine: false, // removes unnecesary scrollbar
              theme: theme === 'light' ? 'vs' : 'vs-dark',
              tabSize: 2,
            }}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
