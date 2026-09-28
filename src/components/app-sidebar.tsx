'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Settings,
  CircleUser,
  LogOut,
  FilePen,
  HelpCircle,
  Users,
  BarChart2,
  Command,
} from 'lucide-react';
import { ProctoVisionLogo } from '@/components/icons/proctovision-logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { mockUsers } from '@/lib/mock-data';
import { NotificationBell } from '@/components/notification-bell';
import { GlobalSearch } from '@/components/global-search';
import { Badge } from '@/components/ui/badge';

const adminUser = mockUsers.find(u => u.role === 'admin');

export function AppSidebar() {
  const pathname = usePathname();

  const mainMenuItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard />,
    },
    {
      href: '/exams',
      label: 'Exams',
      icon: <BookOpen />,
    },
    {
      href: '/questions',
      label: 'Question Bank',
      icon: <HelpCircle />,
    },
    {
      href: '/students',
      label: 'Students',
      icon: <Users />,
    },
    {
      href: '/reports',
      label: 'Reports',
      icon: <FileText />,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: <BarChart2 />,
    },
  ];

  const takeExamItem = {
    href: '/dashboard/exams/1/take',
    label: 'Take Exam (Demo)',
    icon: <FilePen />,
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 gap-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ProctoVisionLogo className="w-8 h-8 text-sidebar-primary" />
          <span className="text-xl font-semibold font-headline text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            ProctoVision
          </span>
        </Link>
        {/* Search + Notifications row */}
        <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
          <GlobalSearch />
          <NotificationBell />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={takeExamItem.href}>
              <SidebarMenuButton
                isActive={isActive(takeExamItem.href)}
                tooltip={{ children: takeExamItem.label }}
                className="text-accent"
              >
                {takeExamItem.icon}
                <span>{takeExamItem.label}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1 py-0 h-4 group-data-[collapsible=icon]:hidden">DEMO</Badge>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/settings">
              <SidebarMenuButton
                isActive={isActive('/settings')}
                tooltip={{ children: 'Settings' }}
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="justify-start w-full h-12 p-2 text-left group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:justify-center hover:bg-sidebar-accent">
               <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={adminUser?.avatarUrl} alt={adminUser?.name} />
                  <AvatarFallback>{adminUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium text-sidebar-foreground">{adminUser?.name}</p>
                  <p className="text-xs text-sidebar-foreground/70">{adminUser?.email}</p>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <CircleUser className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
