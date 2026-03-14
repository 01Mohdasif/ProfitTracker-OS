"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store } from '@/lib/store';
import { User } from '@/lib/types';
import { AppSidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { Input } from '@/components/ui/input';
import { Search, Bell, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = Store.getAuth();
    if (!auth) {
      router.push('/auth/login');
    } else {
      setUser(auth);
    }
  }, [router]);

  const handleLogout = () => {
    Store.setAuth(null);
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} user={user} />
      <SidebarInset className="flex flex-col min-w-0">
        <header className="h-16 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent>Toggle Sidebar View</TooltipContent>
            </Tooltip>
            {/* <div className="relative w-64 md:w-96 max-w-full hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search data, projects..." 
                className="pl-10 bg-secondary/50 border-none h-9 rounded-full focus-visible:ring-primary" 
              />
            </div> */}
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-background"></span>
                </button>
              </TooltipTrigger>
              <TooltipContent>View Notifications</TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-3 pl-2 md:pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{user.role.toLowerCase()}</p>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/50 transition-colors">
                      <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>
        <Footer className="py-6 border-t border-border/40 text-sm bg-background/50 mt-auto" />
      </SidebarInset>
    </SidebarProvider>
  );
}
