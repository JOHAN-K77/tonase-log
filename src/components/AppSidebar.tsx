import { Scale, History } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/context/SessionContext";

const items = [
  { title: "Timbang", url: "/", icon: Scale, confid: false },
  { title: "Riwayat", url: "/history", icon: History, confid: false },
  { title: "Karyawan", url: "/karyawan", icon: History, confid: true },
  { title: "Jenis", url: "/jenis", icon: History, confid: true },
  { title: "Lokasi", url: "/lokasi", icon: History, confid: true },
  { title: "Supplier", url: "/supplier", icon: History, confid: true },
];

export function AppSidebar() {
  const { sessionActive } = useSession();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                (sessionActive?.role === "admin" || !item.confid) &&
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
