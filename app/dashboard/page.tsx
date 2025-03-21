import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Clock, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  // Mock projects data
  const projects = [
    {
      id: "1",
      title: "Modern Office Building",
      description: "10-story commercial space with sustainable design elements",
      status: "In Progress",
      lastUpdated: "2 hours ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "2",
      title: "Residential Complex",
      description: "Multi-family housing with integrated green spaces",
      status: "Draft",
      lastUpdated: "Yesterday",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
    {
      id: "3",
      title: "Urban Retail Center",
      description: "Mixed-use development with retail and office spaces",
      status: "Complete",
      lastUpdated: "2 days ago",
      thumbnail: "/placeholder.svg?height=200&width=300",
    },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your design projects</p>
        </div>
        <Link href="/project/new">
          <Button className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        <Link href="/project/new" className="block h-full">
          <Card className="border-dashed h-full flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-primary/80 transition-colors">
            <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium">Create New Project</h3>
            <p className="text-sm text-muted-foreground mt-2">Start designing with AI assistance</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-video relative bg-muted">
        <img src={project.thumbnail || "/placeholder.svg"} alt={project.title} className="object-cover w-full h-full" />
        <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
          {project.status}
        </span>
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 mt-auto">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {project.lastUpdated}
          </div>
          <Link href={`/project/${project.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              Open <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

