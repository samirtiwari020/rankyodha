import {
  LayoutDashboard,
  CalendarCheck,
  BookOpen,
  MessageCircleQuestion,
  BarChart3,
  Brain,
  GraduationCap,
  FileText,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Study Plan", url: "/planner", icon: CalendarCheck },
  { title: "Practice", url: "/practice", icon: BookOpen },
  { title: "Doubt Solver", url: "/ai-solver", icon: MessageCircleQuestion },
  { title: "Revision", url: "/revision", icon: GraduationCap },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const toolItems = [
  { title: "AI One-Pager", url: "/one-pager", icon: FileText },
  { title: "AI Interviewer", url: "/interview", icon: MessageSquare },
  { title: "Notes", url: "/notes", icon: FileText },
  { title: "Gamification", url: "/gamification", icon: Trophy },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderNavItems = (items: typeof navItems) =>
    items.map((item) => {
      const isActive = item.url === "/dashboard"
        ? location.pathname === "/dashboard"
        : location.pathname.startsWith(item.url);
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === "/dashboard"}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group/item ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
              activeClassName=""
            >
              <item.icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground group-hover/item:text-foreground"
              }`} />
              {!collapsed && <span>{item.title}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300">
            <Brain className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-extrabold text-lg gradient-text tracking-tight">NeuroPrep</span>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {renderNavItems(navItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 mb-1">
              Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {renderNavItems(toolItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
