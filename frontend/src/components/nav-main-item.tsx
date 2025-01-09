import { useWindowStore } from '@/window-store'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowRightLeft,
  FilePen,
  Files,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Input } from './ui/input'
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar'

export function NavMainItem({
  requestId,
}: {
  requestId: string
}) {
  const { isMobile, open } = useSidebar()

  const requestTitle = useWindowStore(
    (store) => store.requests[requestId].title,
  )
  const activeRequestId = useWindowStore.use.activeRequestId()
  const editingNameOfRequestId = useWindowStore.use.editingNameOfRequestId()
  const duplicateRequest = useWindowStore.use.duplicateRequest()
  const deleteRequest = useWindowStore.use.deleteRequest()
  const setActiveRequestId = useWindowStore.use.setActiveRequestId()
  const setEditingNameOfRequestId =
    useWindowStore.use.setEditingNameOfRequestId()
  const updateRequest = useWindowStore.use.updateRequest()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isSorting,
  } = useSortable({ id: requestId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  let timeEditingStarted = 0
  if (editingNameOfRequestId === requestId) {
    timeEditingStarted = Date.now()
  }

  const inputRef = useRef<HTMLInputElement>(null)
  const inputRefFocusAndSelect = useCallback(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])
  useEffect(() => {
    if (inputRef && editingNameOfRequestId === requestId) {
      const r = setTimeout(() => {
        inputRefFocusAndSelect()
      }, 0) // For some reason, setInputFocus() is not working outside the setTimeout.

      return () => {
        clearTimeout(r)
      }
    }
  }, [editingNameOfRequestId, requestId, inputRefFocusAndSelect])

  const updateRequestTitle = useCallback(() => {
    updateRequest(requestId, {
      title: inputRef.current?.value ?? requestTitle,
    })
  }, [requestId, updateRequest, requestTitle])

  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <SidebarMenuItem
      onContextMenu={(event) => {
        // On right click, open the dropdown menu.
        // TODO: Fix bug when sidebar is minimized. Consider using a context menu instead.
        event.preventDefault()
        setDropdownOpen(true)
      }}
    >
      <SidebarMenuButton
        title={open ? requestTitle : ''} // Show full title as native tooltip (Helpful if truncated).
        tooltip={requestTitle}
        isActive={activeRequestId === requestId}
        onClick={() => {
          setActiveRequestId(requestId)
        }}
        asChild
      >
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          <ArrowRightLeft />
          {editingNameOfRequestId !== requestId ? (
            <span>{requestTitle}</span>
          ) : (
            <Input
              ref={inputRef}
              className="pl-0 h-6"
              defaultValue={requestTitle}
              spellCheck="false"
              onBlur={() => {
                if (Date.now() - timeEditingStarted < 250) {
                  // If focus goes out of this element within a certain threshold, refocus.
                  // This solves a bug where focus is lost after ~100ms for some reason (not due to a re-render).
                  inputRefFocusAndSelect()
                } else {
                  // For example, this runs when clicking outside of the input field.
                  updateRequestTitle()
                  setEditingNameOfRequestId('')
                }
              }}
              onKeyDown={(event) => {
                switch (event.key) {
                  case 'Enter':
                    updateRequestTitle()
                    setEditingNameOfRequestId('')
                    break
                  case 'Escape':
                    setEditingNameOfRequestId('')
                    break
                  default:
                    break
                }
                event.key
              }}
            />
          )}
        </div>
      </SidebarMenuButton>
      <DropdownMenu
        open={dropdownOpen}
        onOpenChange={(open) => setDropdownOpen(open)}
      >
        <DropdownMenuTrigger onClick={() => setDropdownOpen(true)} asChild>
          <SidebarMenuAction
            showOnHover
            className={`${isSorting ? 'invisible' : ''}`}
          >
            <MoreHorizontal />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 rounded-lg"
          side={isMobile ? 'bottom' : 'right'}
          align={isMobile ? 'end' : 'start'}
        >
          {/* <DropdownMenuItem>
                  <FolderOpen className="text-muted-foreground" />
                  <span>Reveal in Finder</span> // TODO: For templates
                </DropdownMenuItem> */}
          <DropdownMenuItem
            onClick={() => {
              setEditingNameOfRequestId(requestId)
            }}
          >
            <FilePen className="text-muted-foreground" />
            <span>Rename Request</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              duplicateRequest(requestId)
            }}
          >
            <Files className="text-muted-foreground" />
            <span>Duplicate Request</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              // TODO: Add a deletion confirmation dialog. (Maybe only for templates)
              deleteRequest(requestId)
            }}
          >
            <Trash2 className="text-muted-foreground" />
            <span>Delete Request</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}
