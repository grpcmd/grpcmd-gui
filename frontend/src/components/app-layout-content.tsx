import { System } from '@wailsio/runtime'
import { Badge } from './ui/badge'
import { type Sidebar, SidebarTrigger, useSidebar } from './ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

export function AppLayoutContent({
  sidebarCollapsibleType,
  setSidebarCollapsibleType,
  children,
}: {
  sidebarCollapsibleType: React.ComponentProps<typeof Sidebar>['collapsible']
  setSidebarCollapsibleType: React.Dispatch<
    React.SetStateAction<React.ComponentProps<typeof Sidebar>['collapsible']>
  >
  children: React.ReactNode
}) {
  const { open } = useSidebar()

  return (
    <main className="w-full">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger
              className={`absolute transition-[margin] ${System.IsMac() ? 'mt-[6.25px]' : 'mt-0'} ${System.IsMac() ? 'ml-[70px]' : 'ml-[6.25px]'} ${System.IsMac() && !open ? (sidebarCollapsibleType === 'offcanvas' ? 'md:ml-[70px]' : 'md:ml-[24px]') : 'md:ml-[6.25px]'}`}
              onMouseDown={() => {
                setSidebarCollapsibleType('offcanvas')
              }}
            />
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            Toggle Sidebar
            <Badge variant={'outline'} className="ml-4 text-primary-foreground">
              {System.IsMac() ? '⌘ B' : 'Ctrl + B'}
            </Badge>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {children}
    </main>
  )
}
