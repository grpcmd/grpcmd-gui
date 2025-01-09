import { Plus } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useWindowStore } from '@/window-store'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { System } from '@wailsio/runtime'
import { useCallback, useEffect } from 'react'
import { NavMainItem } from './nav-main-item'
import { Badge } from './ui/badge'

export function NavMain() {
  const sortOrder = useWindowStore.useShallow.sortOrder()
  const addRequest = useWindowStore.use.addRequest()
  const dndMoveRequests = useWindowStore.use.dndMoveRequests()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      dndMoveRequests(active.id.toString(), over.id.toString())
    }
  }

  // The pointer activation constraint is required for proper interaction and for onClick of the nav-main-item.tsx to work.
  // If the distance constraint is not met, the drag doesn't begin, the click registers, and the active item updates.
  // If the distance constraint is met, the drag begins, the onClick doesn't run, and so, the active item doesn't update.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === 't' && (event.metaKey || event.ctrlKey)) {
      addRequest()
    }
  }, [addRequest])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Requests</SidebarGroupLabel>
      <SidebarGroupAction>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Plus onClick={addRequest} />
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              New Request
              <Badge
                variant={'outline'}
                className="ml-4 text-primary-foreground"
              >
                {System.IsMac() ? '⌘ T' : 'Ctrl + T'}
              </Badge>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="sr-only">New Request</span>
      </SidebarGroupAction>
      <SidebarMenu>
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortOrder}
            strategy={verticalListSortingStrategy}
          >
            {sortOrder.map((id) => (
              <NavMainItem requestId={id} key={id} />
            ))}
          </SortableContext>
        </DndContext>
      </SidebarMenu>
    </SidebarGroup>
  )
}
