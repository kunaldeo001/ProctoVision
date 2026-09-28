'use client';

import { useState } from 'react';
import { mockNotifications } from '@/lib/mock-data';
import type { Notification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, CheckCheck, AlertTriangle, Info, CheckCircle2, XOctagon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const typeConfig = {
  danger: { icon: <XOctagon className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  info: { icon: <Info className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 text-sidebar-foreground hover:bg-sidebar-accent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" className="w-80 p-0 shadow-xl" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="font-semibold text-sm">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={markAllRead}>
              <CheckCheck className="w-3 h-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => {
                const cfg = typeConfig[n.type];
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors",
                      !n.read && "bg-primary/5"
                    )}
                    onClick={() => markRead(n.id)}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", cfg.bg, cfg.color)}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium leading-tight", !n.read && "font-semibold")}>{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground h-7" asChild>
            <Link href="/settings">View all settings</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
