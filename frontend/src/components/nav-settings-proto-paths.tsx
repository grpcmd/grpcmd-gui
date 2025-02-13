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

export default function NavSettingsProtoPaths() {
  const protoPaths = useWindowStore.use.protoPaths()
  const addProtoPaths = useWindowStore.use.addProtoPaths()
  const deleteProtoPaths = useWindowStore.use.deleteProtoPaths()

  const handleAdd = async () => {
    const result = (await Dialogs.OpenFile({
      CanChooseDirectories: true,
      CanChooseFiles: false,
      AllowsMultipleSelection: true,
      ButtonText: 'Add',
    })) as string[] | null
    if (result === null || result.length === 0) {
      return
    }
    addProtoPaths(result)
  }

  const handleDelete = (path: string) => {
    deleteProtoPaths([path])
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="h-9 py-2">.proto Import Paths</TableHead>
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
            {protoPaths.map((path) => (
              <TableRow key={path}>
                <TableCell
                  className="py-2 font-medium truncate max-w-0 w-full"
                  title={path}
                >
                  {path}
                </TableCell>{' '}
                {/* TODO: Styled tooltip */}
                <TableCell className="py-2 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    aria-label="Delete"
                    onClick={() => handleDelete(path)}
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
