import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWindowStore } from '@/window-store'
import { Dialogs } from '@wailsio/runtime'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export default function NavSettingsProtoFiles() {
  const protoFiles = useWindowStore.use.protoFiles()
  const addProtoFiles = useWindowStore.use.addProtoFiles()
  const deleteProtoFiles = useWindowStore.use.deleteProtoFiles()

  const handleAdd = async () => {
    const result = (await Dialogs.OpenFile({
      CanChooseDirectories: false,
      CanChooseFiles: true,
      AllowsMultipleSelection: true,
      ButtonText: 'Add',
      Filters: [
        {
          DisplayName: 'Protocol Buffer Files',
          Pattern: '*.proto',
        },
      ],
    })) as string[] | null
    if (result === null || result.length === 0) {
      return
    }
    addProtoFiles(result)
  }

  const handleDelete = (file: string) => {
    deleteProtoFiles([file])
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-9 py-2">.proto Import files</TableHead>
              <TableHead className="h-9 py-2 text-right">
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  aria-label="Add"
                  onClick={handleAdd}
                >
                  <Plus size={16} strokeWidth={2} aria-hidden="true" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {protoFiles.map((file) => (
              <TableRow key={file} className="w-full">
                <TableCell
                  className="py-2 font-medium truncate max-w-0 w-full"
                  title={file}
                >
                  {file}
                </TableCell>{' '}
                {/* TODO: Styled tooltip */}
                <TableCell className="py-2 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label="Delete"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
