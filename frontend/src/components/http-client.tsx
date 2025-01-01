import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/lib/utils'
import Editor from '@monaco-editor/react'
import { NotepadTextDashed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GrpcmdService } from '../../bindings/github.com/grpcmd/grpcmd-gui'
import SelectMethod from './select-method'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'

export default function HttpClient() {
  const [address, setAddress] = useState('localhost:50051')
  const [method, setMethod] = useState('')
  const [request, setRequest] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState('light')

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

  return (
    <div className="flex h-screen">
      <div
        className="grid grid-cols-1 grid-rows-[min-content_min-content_min-content_minmax(0,_1fr)_min-content] p-4 space-y-4 border-r w-1/2"
        key="olk-CAhW"
      >
        <h2 className="text-2xl font-bold text-right">Request</h2>
        {/* <div className="grid-rows-subgrid space-y-4" > */}
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
      <div className="grid grid-cols-1 grid-rows-[min-content_minmax(0,_1fr)] p-4 w-1/2">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">Response</h2>
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
          }}
        />
      </div>
    </div>
  )
}
