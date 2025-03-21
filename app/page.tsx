import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Brain, Building, Cpu, LineChart, Users } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="px-4 md:px-6 py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-background to-muted">
        <div className="container mx-auto grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
              AI-Powered Design Platform for Enterprise
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[600px]">
              Transform your design process with our integrated AI platform that combines sketch inputs, voice
              recognition, and real-time feedback from specialized AI agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/dashboard">
                <Button size="lg" className="font-medium">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="font-medium">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative aspect-video">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary rounded-lg">
              <div className="absolute inset-0 bg-grid-white/10"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center">
                <Brain className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 md:px-6 py-12 md:py-24 bg-background">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tighter mb-4">Enterprise-Grade AI Design</h2>
            <p className="text-muted-foreground text-lg">
              Our platform combines the latest in AI technology with robust enterprise features to transform your design
              process.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu />}
              title="AI-Powered Design"
              description="Our specialized AI agents work together to optimize every aspect of your design."
            />
            <FeatureCard
              icon={<Building />}
              title="Code Compliance"
              description="Automatically check designs against local building codes and regulations."
            />
            <FeatureCard
              icon={<Users />}
              title="Multi-Agent Collaboration"
              description="Multiple AI agents work in parallel to analyze different aspects of your design."
            />
            <FeatureCard
              icon={<LineChart />}
              title="Budget Reality Check"
              description="Real-time cost estimation and budget analysis for every design change."
            />
            <FeatureCard
              icon={<Brain />}
              title="Natural Input Methods"
              description="Sketch your ideas or describe them verbally - our AI understands both."
            />
            <FeatureCard
              icon={<ArrowRight />}
              title="Immersive 3D Experience"
              description="Visualize your designs in interactive 3D with lighting and material simulations."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="p-2 w-fit rounded-md bg-primary/10 text-primary mb-3">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

