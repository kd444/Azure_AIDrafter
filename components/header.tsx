"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { useState } from "react";

export function Header() {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            message: "Agent feedback available on Office Building project",
            time: "Just now",
        },
        {
            id: 2,
            message: "Budget analysis complete for Residential Complex",
            time: "2 hours ago",
        },
    ]);

    return (
        <header className="border-b bg-background h-16 flex items-center px-4 lg:px-6">
            <div className="flex-1 flex items-center justify-end space-x-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex flex-col items-start py-2"
                            >
                                <span>{notification.message}</span>
                                <span className="text-xs text-muted-foreground">
                                    {notification.time}
                                </span>
                            </DropdownMenuItem>
                        ))}
                        {notifications.length === 0 && (
                            <DropdownMenuItem
                                disabled
                                className="text-center py-4"
                            >
                                No new notifications
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center cursor-pointer justify-center text-primary">
                            Mark all as read
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="icon">
                    <HelpCircle className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <ModeToggle mode="item" />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Account Settings</DropdownMenuItem>
                        <DropdownMenuItem>Team Management</DropdownMenuItem>
                        <DropdownMenuItem>Billing & Plans</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                JD
                            </div>
                            <span className="hidden sm:inline-block">
                                John Doe
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2">
                            <User className="h-4 w-4" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
