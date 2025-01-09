import { AppLayoutSidebar } from '@/components/app-layout-sidebar'
import { type Sidebar, SidebarProvider } from '@/components/ui/sidebar'
import { useState } from 'react'
import { AppLayoutContent } from './app-layout-content'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsibleType, setSidebarCollapsibleType] =
    useState<React.ComponentProps<typeof Sidebar>['collapsible']>('icon')

  return (
    <SidebarProvider
      style={{
        // @ts-ignore
        '--sidebar-width': '14rem',
        '--sidebar-width-mobile': '14rem',
      }}
    >
      <AppLayoutSidebar
        sidebarCollapsibleType={sidebarCollapsibleType}
        setSidebarCollapsibleType={setSidebarCollapsibleType}
      />
      <AppLayoutContent
        sidebarCollapsibleType={sidebarCollapsibleType}
        setSidebarCollapsibleType={setSidebarCollapsibleType}
      >
        {children}
      </AppLayoutContent>
    </SidebarProvider>
  )
}
