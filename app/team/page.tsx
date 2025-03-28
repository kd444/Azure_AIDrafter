"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BarChart,
    Building2,
    Clock,
    FileText,
    Mail,
    MessageCircle,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Shield,
    UserPlus,
    Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

// Mock team member data
const TEAM_MEMBERS = [
    {
        id: "user1",
        name: "Alice Chen",
        role: "Lead Architect",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "alice.chen@example.com",
        phone: "+1 (555) 123-4567",
        skills: ["Residential", "Commercial", "Sustainable Design"],
        activeProjects: 4,
        completedProjects: 18,
        bio: "Alice specializes in sustainable residential and commercial architecture with over 10 years of experience in award-winning designs.",
        status: "active",
        isAdmin: true,
        efficiency: 82,
    },
    {
        id: "user2",
        name: "Mark Johnson",
        role: "Senior Architect",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "mark.johnson@example.com",
        phone: "+1 (555) 234-5678",
        skills: ["Commercial", "Urban Planning", "Revit"],
        activeProjects: 3,
        completedProjects: 12,
        bio: "Mark focuses on commercial architecture and urban planning, bringing 8 years of experience to complex city projects.",
        status: "active",
        isAdmin: false,
        efficiency: 78,
    },
    {
        id: "user3",
        name: "Sarah Wilson",
        role: "Project Manager",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "sarah.wilson@example.com",
        phone: "+1 (555) 345-6789",
        skills: ["Project Management", "Healthcare", "BIM"],
        activeProjects: 5,
        completedProjects: 15,
        bio: "Sarah manages complex architectural projects with a specialty in healthcare facilities and BIM implementation.",
        status: "active",
        isAdmin: true,
        efficiency: 85,
    },
    {
        id: "user4",
        name: "David Lee",
        role: "Architectural Designer",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "david.lee@example.com",
        phone: "+1 (555) 456-7890",
        skills: ["3D Modeling", "VR/AR", "Parametric Design"],
        activeProjects: 3,
        completedProjects: 9,
        bio: "David specializes in cutting-edge visualization technologies, including VR/AR implementation for architectural presentations.",
        status: "active",
        isAdmin: false,
        efficiency: 79,
    },
    {
        id: "user5",
        name: "Emma Davis",
        role: "Interior Designer",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "emma.davis@example.com",
        phone: "+1 (555) 567-8901",
        skills: ["Interior Design", "Retail", "Hospitality"],
        activeProjects: 2,
        completedProjects: 11,
        bio: "Emma brings spaces to life with a focus on interior design for retail and hospitality projects.",
        status: "away",
        isAdmin: false,
        efficiency: 81,
    },
    {
        id: "user6",
        name: "Michael Brown",
        role: "Structural Engineer",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "michael.brown@example.com",
        phone: "+1 (555) 678-9012",
        skills: ["Structural Engineering", "Timber Construction", "High-Rise"],
        activeProjects: 4,
        completedProjects: 16,
        bio: "Michael ensures the structural integrity of our designs, specializing in timber construction and high-rise buildings.",
        status: "active",
        isAdmin: false,
        efficiency: 83,
    },
    {
        id: "user7",
        name: "Jennifer Taylor",
        role: "Sustainability Consultant",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "jennifer.taylor@example.com",
        phone: "+1 (555) 789-0123",
        skills: ["LEED", "Energy Modeling", "Passive Design"],
        activeProjects: 6,
        completedProjects: 13,
        bio: "Jennifer guides our sustainability initiatives, ensuring projects meet or exceed LEED standards through innovative approaches.",
        status: "active",
        isAdmin: false,
        efficiency: 88,
    },
    {
        id: "user8",
        name: "Robert Garcia",
        role: "Construction Manager",
        avatar: "/placeholder.svg?height=80&width=80",
        email: "robert.garcia@example.com",
        phone: "+1 (555) 890-1234",
        skills: ["Construction Management", "Budget Control", "Scheduling"],
        activeProjects: 3,
        completedProjects: 21,
        bio: "Robert bridges the gap between design and construction, managing budgets and schedules for seamless project execution.",
        status: "offline",
        isAdmin: false,
        efficiency: 80,
    },
];

// Mock team projects data
const TEAM_PROJECTS = [
    {
        id: "proj-001",
        name: "Riverside Mixed-Use Development",
        client: "Urban Developers Inc.",
        progress: 65,
        teamMembers: ["user1", "user3", "user4", "user7"],
        dueDate: "2023-07-15",
        status: "In Progress",
        efficiency: 78,
    },
    {
        id: "proj-002",
        name: "Memorial Hospital Expansion",
        client: "City Healthcare System",
        progress: 42,
        teamMembers: ["user2", "user3", "user6", "user8"],
        dueDate: "2023-09-30",
        status: "In Progress",
        efficiency: 75,
    },
    {
        id: "proj-003",
        name: "Downtown Office Tower",
        client: "MetroWorks Corporation",
        progress: 88,
        teamMembers: ["user1", "user2", "user6"],
        dueDate: "2023-05-10",
        status: "In Review",
        efficiency: 82,
    },
    {
        id: "proj-004",
        name: "Luxury Boutique Hotel",
        client: "Heritage Hospitality Group",
        progress: 30,
        teamMembers: ["user2", "user5", "user7"],
        dueDate: "2023-11-20",
        status: "In Progress",
        efficiency: 79,
    },
    {
        id: "proj-005",
        name: "Community Arts Center",
        client: "City Arts Foundation",
        progress: 95,
        teamMembers: ["user1", "user4", "user5"],
        dueDate: "2023-04-28",
        status: "In Review",
        efficiency: 85,
    },
];

// Helper function to get status color
const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-500";
        case "away":
            return "bg-yellow-500";
        case "offline":
            return "bg-gray-500";
        default:
            return "bg-gray-500";
    }
};

// Helper function to get project status color
const getProjectStatusColor = (status: string) => {
    switch (status) {
        case "In Progress":
            return "bg-blue-500/10 text-blue-500";
        case "In Review":
            return "bg-amber-500/10 text-amber-500";
        case "Complete":
            return "bg-green-500/10 text-green-500";
        default:
            return "bg-gray-500/10 text-gray-500";
    }
};

export default function TeamPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTeamTab, setActiveTeamTab] = useState("all");

    // Filter team members based on search query and active filter
    const filteredTeamMembers = TEAM_MEMBERS.filter((member) => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.skills.some((skill) =>
                skill.toLowerCase().includes(searchQuery.toLowerCase())
            );

        if (activeTeamTab === "all") return matchesSearch;
        if (activeTeamTab === "architects")
            return (
                matchesSearch &&
                (member.role.includes("Architect") ||
                    member.role.includes("Designer"))
            );
        if (activeTeamTab === "engineers")
            return matchesSearch && member.role.includes("Engineer");
        if (activeTeamTab === "management")
            return (
                matchesSearch &&
                (member.role.includes("Manager") || member.isAdmin)
            );

        return matchesSearch;
    });

    // Find team member names by IDs
    const getTeamMemberNames = (memberIds: string[]) => {
        return memberIds.map((id) => {
            const member = TEAM_MEMBERS.find((m) => m.id === id);
            return member ? member.name : "Unknown";
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your architectural team and collaborators
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="gap-1">
                        <UserPlus className="h-4 w-4" />
                        Invite
                    </Button>
                    <Button className="gap-1">
                        <Users className="h-4 w-4" />
                        Manage Roles
                    </Button>
                </div>
            </div>

            {/* Team Tabs & Search */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <Tabs
                    defaultValue="all"
                    className="w-full sm:w-auto"
                    onValueChange={setActiveTeamTab}
                >
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="architects">Architects</TabsTrigger>
                        <TabsTrigger value="engineers">Engineers</TabsTrigger>
                        <TabsTrigger value="management">Management</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search team..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeamMembers.map((member) => (
                    <TeamMemberCard key={member.id} member={member} />
                ))}

                {/* Add Team Member Card */}
                <Card className="border-dashed flex flex-col items-center justify-center p-6 h-full">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium">Add Team Member</h3>
                    <p className="text-sm text-muted-foreground text-center mt-2">
                        Invite a new architect, engineer, or collaborator to
                        join your team
                    </p>
                    <Button className="mt-6">Invite Member</Button>
                </Card>
            </div>

            {/* Team Projects Section */}
            <div className="mt-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Team Projects
                    </h2>
                    <Button variant="outline" className="gap-1">
                        <Plus className="h-4 w-4" />
                        New Project
                    </Button>
                </div>

                <div className="space-y-4">
                    {TEAM_PROJECTS.map((project) => (
                        <TeamProjectCard
                            key={project.id}
                            project={project}
                            teamMembers={getTeamMemberNames(
                                project.teamMembers
                            )}
                            statusColor={getProjectStatusColor(project.status)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function TeamMemberCard({ member }: { member: any }) {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                        <div className="relative">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback>
                                    {member.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                    member.status
                                )}`}
                            />
                        </div>
                        <div>
                            <CardTitle className="text-lg">
                                {member.name}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1">
                                {member.role}
                                {member.isAdmin && (
                                    <Badge
                                        variant="outline"
                                        className="ml-2 text-xs font-normal py-0 h-5"
                                    >
                                        <Shield className="h-3 w-3 mr-1" />{" "}
                                        Admin
                                    </Badge>
                                )}
                            </CardDescription>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                                <Mail className="h-4 w-4 mr-2" /> Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <MessageCircle className="h-4 w-4 mr-2" />{" "}
                                Message
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Building2 className="h-4 w-4 mr-2" /> View
                                Projects
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" /> View
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive">
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm line-clamp-2 text-muted-foreground">
                        {member.bio}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                        {member.skills.map((skill: string) => (
                            <Badge
                                key={skill}
                                variant="secondary"
                                className="font-normal"
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex justify-between text-sm pt-2">
                        <div>
                            <div className="text-muted-foreground">
                                Active Projects
                            </div>
                            <div className="font-medium">
                                {member.activeProjects}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted-foreground">
                                Completed
                            </div>
                            <div className="font-medium">
                                {member.completedProjects}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TeamProjectCard({
    project,
    teamMembers,
    statusColor,
}: {
    project: any;
    teamMembers: string[];
    statusColor: string;
}) {
    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-center p-4">
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium">
                                        {project.name}
                                    </h3>
                                    <Badge className={statusColor}>
                                        {project.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Client: {project.client}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 md:justify-end">
                                <div className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Due:{" "}
                                    {new Date(
                                        project.dueDate
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                    })}
                                </div>

                                <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Details
                                </Button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-muted-foreground">
                                    Progress
                                </span>
                                <span className="text-sm font-medium">
                                    {project.progress}%
                                </span>
                            </div>
                            <Progress
                                value={project.progress}
                                className="h-2"
                            />
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground block">
                                    Team Members
                                </span>
                                <div className="flex items-center mt-1">
                                    <div className="flex -space-x-2">
                                        {project.teamMembers
                                            .slice(0, 3)
                                            .map(
                                                (id: string, index: number) => {
                                                    const member =
                                                        TEAM_MEMBERS.find(
                                                            (m) => m.id === id
                                                        );
                                                    return (
                                                        <Avatar
                                                            key={id}
                                                            className="h-6 w-6 border-2 border-background"
                                                        >
                                                            <AvatarImage
                                                                src={
                                                                    member?.avatar
                                                                }
                                                                alt={
                                                                    member?.name
                                                                }
                                                            />
                                                            <AvatarFallback className="text-xs">
                                                                {member?.name
                                                                    .split(" ")
                                                                    .map(
                                                                        (
                                                                            n: string
                                                                        ) =>
                                                                            n[0]
                                                                    )
                                                                    .join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    );
                                                }
                                            )}

                                        {project.teamMembers.length > 3 && (
                                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                                                +
                                                {project.teamMembers.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm ml-3">
                                        {teamMembers.slice(0, 2).join(", ")}
                                        {teamMembers.length > 2
                                            ? ` +${teamMembers.length - 2} more`
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <BarChart className="h-5 w-5 text-muted-foreground" />
                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">
                                        Design Efficiency
                                    </span>
                                    <span className="font-medium">
                                        {project.efficiency}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
