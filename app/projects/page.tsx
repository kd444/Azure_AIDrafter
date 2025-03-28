"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Building2,
    Calendar,
    Clock,
    Copy,
    Download,
    Edit2,
    FileText,
    MoreVertical,
    Plus,
    Search,
    Settings,
    Star,
    StarOff,
    Trash2,
    Users,
} from "lucide-react";
import Link from "next/link";

// Mock project data
const MOCK_PROJECTS = [
    {
        id: "proj-001",
        title: "Modern Office Building",
        description:
            "10-story commercial space with sustainable design elements",
        status: "In Progress",
        client: "TechCorp Inc.",
        lastUpdated: "2 hours ago",
        dateCreated: "April 15, 2023",
        team: ["Alice Chen", "Mark Johnson", "Sarah Wilson"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Commercial", "Sustainable", "Urban"],
        favorite: true,
        progress: 65,
    },
    {
        id: "proj-002",
        title: "Residential Complex",
        description: "Multi-family housing with integrated green spaces",
        status: "Draft",
        client: "GreenHome Developers",
        lastUpdated: "Yesterday",
        dateCreated: "April 10, 2023",
        team: ["John Smith", "Emma Davis"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Residential", "Multi-family", "Green"],
        favorite: false,
        progress: 25,
    },
    {
        id: "proj-003",
        title: "Urban Retail Center",
        description: "Mixed-use development with retail and office spaces",
        status: "Complete",
        client: "Metro Developments LLC",
        lastUpdated: "2 days ago",
        dateCreated: "March 28, 2023",
        team: ["Robert Lee", "Maria Garcia", "David Wong"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Commercial", "Retail", "Urban"],
        favorite: true,
        progress: 100,
    },
    {
        id: "proj-004",
        title: "Community Healthcare Facility",
        description:
            "Modern clinic with specialized care units and healing garden",
        status: "In Progress",
        client: "Westside Health Partners",
        lastUpdated: "4 days ago",
        dateCreated: "March 15, 2023",
        team: ["James Wilson", "Linda Chen"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Healthcare", "Community", "Accessibility"],
        favorite: false,
        progress: 45,
    },
    {
        id: "proj-005",
        title: "Educational Campus Redesign",
        description:
            "Renovation and expansion of existing university buildings",
        status: "Planning",
        client: "State University",
        lastUpdated: "1 week ago",
        dateCreated: "March 10, 2023",
        team: ["Michael Brown", "Emily Taylor", "Jason Lee"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Education", "Renovation", "Institutional"],
        favorite: false,
        progress: 15,
    },
    {
        id: "proj-006",
        title: "Waterfront Hotel & Spa",
        description:
            "Luxury hospitality project with focus on wellness and views",
        status: "On Hold",
        client: "Luxury Resorts International",
        lastUpdated: "2 weeks ago",
        dateCreated: "February 20, 2023",
        team: ["Sophia Martinez", "Daniel Kim"],
        thumbnail: "/placeholder.svg?height=200&width=300",
        tags: ["Hospitality", "Luxury", "Waterfront"],
        favorite: true,
        progress: 35,
    },
];

export default function ProjectsPage() {
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    // Filter projects based on search query and active filter
    const filteredProjects = projects.filter((project) => {
        const matchesSearch =
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
            );

        if (activeFilter === "all") return matchesSearch;
        if (activeFilter === "favorites")
            return matchesSearch && project.favorite;
        if (activeFilter === "inProgress")
            return matchesSearch && project.status === "In Progress";
        if (activeFilter === "completed")
            return matchesSearch && project.status === "Complete";
        return matchesSearch;
    });

    const toggleFavorite = (id: string) => {
        setProjects(
            projects.map((project) =>
                project.id === id
                    ? { ...project, favorite: !project.favorite }
                    : project
            )
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "In Progress":
                return "bg-blue-500/10 text-blue-500";
            case "Complete":
                return "bg-green-500/10 text-green-500";
            case "Draft":
                return "bg-amber-500/10 text-amber-500";
            case "Planning":
                return "bg-purple-500/10 text-purple-500";
            case "On Hold":
                return "bg-gray-500/10 text-gray-500";
            default:
                return "bg-gray-500/10 text-gray-500";
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Projects
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track your architectural designs
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link href="/templates">
                        <Button variant="outline" className="gap-1">
                            <FileText className="h-4 w-4" />
                            Templates
                        </Button>
                    </Link>
                    <Link href="/project/new">
                        <Button className="gap-1">
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search projects..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Tabs
                    defaultValue="all"
                    className="w-full sm:w-auto"
                    onValueChange={setActiveFilter}
                >
                    <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="favorites">Favorites</TabsTrigger>
                        <TabsTrigger value="inProgress">
                            In Progress
                        </TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onToggleFavorite={toggleFavorite}
                            getStatusColor={getStatusColor}
                        />
                    ))}

                    {/* Create New Project Card */}
                    <Link href="/project/new" className="block h-full">
                        <Card className="border-dashed h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-primary/80 transition-colors">
                            <div className="rounded-full bg-primary/10 p-4 mb-4">
                                <Plus className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-medium">
                                Create New Project
                            </h3>
                            <p className="text-sm text-muted-foreground mt-2">
                                Start designing with AI assistance
                            </p>
                        </Card>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                        <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                        No projects found
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                        We couldn't find any projects matching your search
                        criteria. Try adjusting your filters or create a new
                        project.
                    </p>
                    <Link href="/project/new" className="mt-6">
                        <Button className="gap-1">
                            <Plus className="h-4 w-4" />
                            New Project
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}

function ProjectCard({
    project,
    onToggleFavorite,
    getStatusColor,
}: {
    project: any;
    onToggleFavorite: (id: string) => void;
    getStatusColor: (status: string) => string;
}) {
    return (
        <Card className="overflow-hidden flex flex-col h-full">
            <div className="aspect-video relative bg-muted">
                <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className={`${getStatusColor(
                            project.status
                        )} border-none font-medium`}
                    >
                        {project.status}
                    </Badge>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        onClick={(e) => {
                            e.preventDefault();
                            onToggleFavorite(project.id);
                        }}
                    >
                        {project.favorite ? (
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ) : (
                            <StarOff className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">
                            {project.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                            {project.description}
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Edit2 className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Copy className="h-4 w-4" /> Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Download className="h-4 w-4" /> Export
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <Settings className="h-4 w-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-destructive gap-2">
                                <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag: string) => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="font-normal"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Client: {project.client}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Created: {project.dateCreated}</span>
                    </div>

                    {/* Progress bar */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                                Progress
                            </span>
                            <span>{project.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-2 mt-auto">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {project.lastUpdated}
                    </div>
                    <Link href={`/project/${project.id}`}>
                        <Button variant="default" size="sm">
                            Open Project
                        </Button>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
