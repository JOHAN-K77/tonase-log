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

type SidebarItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  access?: "admin" | "non-admin";
};

const items: SidebarItem[] = [
  { title: "Timbang", url: "/", icon: Scale, access: "non-admin" },
  { title: "Riwayat", url: "/history", icon: History },
  { title: "Karyawan", url: "/karyawan", icon: History, access: "admin" },
  { title: "Jenis", url: "/jenis", icon: History, access: "admin" },
  { title: "Lokasi", url: "/lokasi", icon: History, access: "admin" },
  { title: "Supplier", url: "/supplier", icon: History, access: "admin" },
];

export function AppSidebar() {
  const { sessionActive } = useSession();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const DisplaySidebar = ({toDisplay}: {toDisplay: SidebarItem}) => {
    return (
      <SidebarMenuItem key={toDisplay.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={toDisplay.url}
            end
            className="hover:bg-muted/50"
            activeClassName="bg-muted text-primary font-medium"
          >
            <toDisplay.icon className="mr-2 h-4 w-4" />
            {!collapsed && <span>{toDisplay.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                (!item.access) ?
                  <DisplaySidebar toDisplay={item} />
                  : (item.access === "admin" && sessionActive?.role === "admin")
                    ? <DisplaySidebar toDisplay={item} />
                    : (item.access === "non-admin" && sessionActive?.role !== "admin") ? <DisplaySidebar toDisplay={item} /> : null
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}