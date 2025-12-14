import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/layouts/sidebar/app-sidebar";
import { DynamicBreadcrumb } from "@/layouts/sidebar/dynamic-breadcrumb";
import { ThemeToggle } from "./ThemeToggle";

export default function PrivateLayout() {
  return (
    <SidebarProvider>
      <div className='flex h-screen w-full overflow-hidden'>
        <AppSidebar />

        <SidebarInset className='flex flex-col flex-1 overflow-hidden'>
          <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-10'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <DynamicBreadcrumb />
            <div className='ml-auto'>
              <ThemeToggle />
            </div>
          </header>

          <main className='flex-1 overflow-auto bg-linear-to-b from-background via-background/95 to-muted/30'>
            <div className='animate-fade-slide-in'>
              <div className='mx-auto w-full px-2 md:px-4 lg:px-12 py-8'>
                <Outlet />
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
