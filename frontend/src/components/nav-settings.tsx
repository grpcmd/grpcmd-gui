import { Cog, Settings } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { System } from '@wailsio/runtime'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'

export function NavSettings() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.key === ',' && (event.metaKey || event.ctrlKey)) {
      setDialogOpen(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])
  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DialogTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={{
                children: (
                  <div>
                    Settings
                    <Badge
                      variant={'outline'}
                      className="ml-4 text-primary-foreground"
                    >
                      {System.IsMac() ? '⌘ ,' : 'Ctrl + ,'}
                    </Badge>
                  </div>
                ),
              }}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">
                  <Settings />
                </AvatarFallback>
              </Avatar>
              <div className="flex text-left text-sm leading-tight w-full justify-between">
                <span className="truncate font-semibold">Settings</span>
                <Badge variant={'outline'} className="ml-4">
                  {System.IsMac() ? '⌘ ,' : 'Ctrl + ,'}
                </Badge>
              </div>
            </SidebarMenuButton>
          </DialogTrigger>
        </SidebarMenuItem>
      </SidebarMenu>

      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-2xl [&>button:last-child]:top-5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Settings
          </DialogTitle>
          <div className="h-[60vh] px-2 py-2">
            <DialogDescription asChild>
              <Tabs
                defaultValue="tab-general"
                orientation="vertical"
                className="grid grid-cols-[min-content_minmax(0,_1fr)] grid-rows-1 w-full h-full gap-2"
              >
                <TabsList className="flex-col gap-1 rounded-none bg-transparent px-1 py-0 text-foreground h-full justify-start">
                  <TabsTrigger
                    value="tab-general"
                    className="relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent"
                  >
                    <Cog
                      className="-ms-0.5 me-1.5 opacity-60"
                      size={16}
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    General
                  </TabsTrigger>
                </TabsList>
                <div className="grow rounded-lg border border-border text-start">
                  <TabsContent value="tab-general">
                    <p className="px-4 py-1.5 text-xs text-muted-foreground">
                      There will soon be many options here including the ablity
                      to add import paths to use your .proto files.
                    </p>
                  </TabsContent>
                </div>
              </Tabs>
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
