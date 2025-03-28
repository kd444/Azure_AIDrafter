"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Home,
    LayoutDashboard,
    FileBox,
    Settings,
    Users,
    BarChart3,
    Building2,
    ChevronLeft,
    ChevronRight,
    Cpu,
    LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div
            className={cn(
                "border-r h-screen bg-background relative transition-all duration-300",
                collapsed ? "w-16" : "w-64"
            )}
        >
            <div className="h-16 border-b flex items-center px-4 justify-between">
                <div
                    className={cn(
                        "flex items-center gap-2",
                        collapsed && "justify-center w-full"
                    )}
                >
                    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                        <Cpu className="h-5 w-5 text-primary-foreground" />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg">AIDraft</span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute -right-4 top-16 rounded-full border bg-background",
                        collapsed && "rotate-180"
                    )}
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-4rem)]">
                <div className="py-4">
                    <nav className="space-y-2 px-2">
                        <NavItem
                            href="/"
                            icon={<Home className="h-5 w-5" />}
                            label="Home"
                            active={pathname === "/"}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/dashboard"
                            icon={<LayoutDashboard className="h-5 w-5" />}
                            label="Dashboard"
                            active={pathname === "/dashboard"}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/projects"
                            icon={<FileBox className="h-5 w-5" />}
                            label="Projects"
                            active={pathname.startsWith("/project")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/cad-generator"
                            icon={<Building2 className="h-5 w-5" />}
                            label="CAD Generator"
                            active={pathname.startsWith("/cad-generator")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/cad-test"
                            icon={<Building2 className="h-5 w-5" />}
                            label="CAD Test"
                            active={pathname.startsWith("/cad-test")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/analytics"
                            icon={<BarChart3 className="h-5 w-5" />}
                            label="Analytics"
                            active={pathname.startsWith("/analytics")}
                            collapsed={collapsed}
                        />
                        <NavItem
                            href="/team"
                            icon={<Users className="h-5 w-5" />}
                            label="Team"
                            active={pathname.startsWith("/team")}
                            collapsed={collapsed}
                        />

                        <div
                            className={cn(
                                "my-6 px-4",
                                collapsed && "px-0 flex justify-center"
                            )}
                        >
                            {collapsed ? <hr className="w-6" /> : <hr />}
                        </div>

                        <NavItem
                            href="/settings"
                            icon={<Settings className="h-5 w-5" />}
                            label="Settings"
                            active={pathname.startsWith("/settings")}
                            collapsed={collapsed}
                        />
                    </nav>

                    {!collapsed && (
                        <div className="mt-8 px-4 py-4">
                            <div className="rounded-lg border bg-card p-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                                        <LineChart className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">
                                            Usage Stats
                                        </h4>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">
                                                Projects
                                            </span>
                                            <span>3/10</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary w-[30%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-muted-foreground">
                                                AI Credits
                                            </span>
                                            <span>450/1000</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary w-[45%]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

function NavItem({
    href,
    icon,
    label,
    active,
    collapsed,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    collapsed: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary",
                collapsed && "justify-center px-2"
            )}
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}
