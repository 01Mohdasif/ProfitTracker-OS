"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Role, User } from '@/lib/types';
import { Store } from '@/lib/store';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  LayoutDashboard, 
  LogOut, 
  CheckCircle2,
  Settings,
  BookOpen
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppSidebar({ role, user }: { role: Role; user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Store.setAuth(null);
    router.push('/auth/login');
  };

  const tenantLinks = [
    { name: 'Analytics', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Project Details', href: '/dashboard/projectdetails', icon: Users },
    { name: 'System Guide', href: '/dashboard/guide', icon: BookOpen },
  ];

  const employeeLinks = [
    { name: 'My Tasks', href: '/dashboard', icon: CheckCircle2 },
    { name: 'Project Overview', href: '/dashboard/overview', icon: Briefcase },
  ];

  const links = role === 'TENANT' ? tenantLinks : employeeLinks;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shrink-0">
            <BarChart3 className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold font-headline tracking-tighter truncate group-data-[collapsible=icon]:hidden">ProfitTracker</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    isActive={pathname === link.href}
                    onClick={() => router.push(link.href)}
                    tooltip={link.name}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/40">
        <SidebarMenu>
          {/* <SidebarMenuItem>
             <SidebarMenuButton tooltip="Settings">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
              tooltip="Logout"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-3 mt-4 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={`https://picsum.photos/seed/${user.id}/32/32`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{role.toLowerCase()}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
