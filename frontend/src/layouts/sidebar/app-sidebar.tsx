import React from "react";
import { MessageSquare, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import GenieLogo from "../GenieLogo";
import { Link } from "react-router-dom";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const projects = [
    { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { name: "AI Chat", url: "/chat", icon: MessageSquare },
  ];

  return (
    <Sidebar variant='sidebar' side='left' collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mb-4'
          asChild
        >
          <Link to='/dashboard' className='flex w-full items-center gap-2'>
            <div className='flex items-center justify-center'>
              <GenieLogo size={32} />
            </div>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>Genie</span>
              <span className='truncate text-xs text-sidebar-foreground/70'>
                AI Platform
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain projects={projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
