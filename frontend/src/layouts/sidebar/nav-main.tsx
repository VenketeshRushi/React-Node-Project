import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";

export function NavMain({ projects }: { projects: any }) {
  const location = useLocation();

  return (
    <SidebarMenu>
      {projects.map((item: any) => {
        const isActive =
          location.pathname === item.url ||
          location.pathname.startsWith(item.url + "/");

        const Icon = item.icon;

        return (
          <SidebarMenuItem key={item.name} className='px-2'>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link to={item.url}>
                {Icon && <Icon />}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
