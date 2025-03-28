"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Building2,
    Calendar,
    Clock,
    Download,
    FileText,
    LayoutDashboard,
    Maximize2,
    Ruler,
    Users,
    CheckCircle2,
} from "lucide-react";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
} from "recharts";

// Custom colors for charts
const COLORS = [
    "#4361ee",
    "#3a86ff",
    "#4cc9f0",
    "#4895ef",
    "#560bad",
    "#480ca8",
];

export default function ArchitecturalAnalyticsPage() {
    const [dateRange, setDateRange] = useState("last90days");

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Architectural Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track design metrics and building performance
                    </p>
                </div>

                <div className="flex gap-2">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="last30days">
                                Last 30 Days
                            </SelectItem>
                            <SelectItem value="last90days">
                                Last 90 Days
                            </SelectItem>
                            <SelectItem value="lastYear">Last Year</SelectItem>
                            <SelectItem value="allTime">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Floor Area Designed
                        </CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">38,450 m²</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +12% vs. previous quarter
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg. Space Efficiency
                        </CardTitle>
                        <Maximize2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87.4%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +5.2% vs. traditional designs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sustainability Score
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68/100</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +18 points vs. industry average
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Design Iterations
                        </CardTitle>
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            -38% vs. manual methods
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs defaultValue="projects">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="spatial">Spatial</TabsTrigger>
                    <TabsTrigger value="sustainability">
                        Sustainability
                    </TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                {/* Projects Analytics */}
                <TabsContent value="projects" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Building Types */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Building Types</CardTitle>
                                <CardDescription>
                                    Distribution of projects by building
                                    category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: "Residential",
                                                    value: 35,
                                                },
                                                {
                                                    name: "Commercial",
                                                    value: 25,
                                                },
                                                {
                                                    name: "Mixed-Use",
                                                    value: 15,
                                                },
                                                {
                                                    name: "Institutional",
                                                    value: 12,
                                                },
                                                {
                                                    name: "Industrial",
                                                    value: 8,
                                                },
                                                { name: "Cultural", value: 5 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name}: ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                        >
                                            {COLORS.map((color, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={color}
                                                />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Design Timeline */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Design Timeline</CardTitle>
                                <CardDescription>
                                    Average duration of design phases (in days)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                phase: "Concept",
                                                traditional: 14,
                                                ai: 5,
                                            },
                                            {
                                                phase: "Schematic",
                                                traditional: 21,
                                                ai: 8,
                                            },
                                            {
                                                phase: "Design Dev",
                                                traditional: 28,
                                                ai: 12,
                                            },
                                            {
                                                phase: "Construction Docs",
                                                traditional: 45,
                                                ai: 24,
                                            },
                                            {
                                                phase: "Revisions",
                                                traditional: 21,
                                                ai: 10,
                                            },
                                        ]}
                                        layout="vertical"
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 80,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis
                                            dataKey="phase"
                                            type="category"
                                            width={80}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="traditional"
                                            name="Traditional Process"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="ai"
                                            name="AI-Assisted"
                                            fill="#3a86ff"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Project Scale */}
                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>
                                    Project Scale Distribution
                                </CardTitle>
                                <CardDescription>
                                    Total floor area by project category (in
                                    square meters)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                category: "Residential",
                                                small: 4200,
                                                medium: 7800,
                                                large: 3200,
                                            },
                                            {
                                                category: "Commercial",
                                                small: 2100,
                                                medium: 5400,
                                                large: 8600,
                                            },
                                            {
                                                category: "Mixed-Use",
                                                small: 1800,
                                                medium: 3600,
                                                large: 4200,
                                            },
                                            {
                                                category: "Institutional",
                                                small: 2400,
                                                medium: 3800,
                                                large: 1900,
                                            },
                                            {
                                                category: "Industrial",
                                                small: 1200,
                                                medium: 2400,
                                                large: 4800,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="category" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="small"
                                            name="Small Projects (<1000m²)"
                                            stackId="a"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="medium"
                                            name="Medium Projects (1000-5000m²)"
                                            stackId="a"
                                            fill="#3a86ff"
                                        />
                                        <Bar
                                            dataKey="large"
                                            name="Large Projects (>5000m²)"
                                            stackId="a"
                                            fill="#4cc9f0"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Spatial Analytics */}
                <TabsContent value="spatial" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Space Allocation</CardTitle>
                                <CardDescription>
                                    Average space usage by building function
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                {
                                                    name: "Primary Use",
                                                    value: 62,
                                                },
                                                {
                                                    name: "Circulation",
                                                    value: 15,
                                                },
                                                { name: "Services", value: 12 },
                                                { name: "Amenities", value: 8 },
                                                { name: "Structure", value: 3 },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) =>
                                                `${name}: ${(
                                                    percent * 100
                                                ).toFixed(0)}%`
                                            }
                                        >
                                            {COLORS.map((color, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={color}
                                                />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Spatial Efficiency</CardTitle>
                                <CardDescription>
                                    Net-to-gross ratio by building type
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                type: "Residential",
                                                traditional: 0.72,
                                                aiOptimized: 0.81,
                                            },
                                            {
                                                type: "Office",
                                                traditional: 0.68,
                                                aiOptimized: 0.78,
                                            },
                                            {
                                                type: "Retail",
                                                traditional: 0.76,
                                                aiOptimized: 0.84,
                                            },
                                            {
                                                type: "Healthcare",
                                                traditional: 0.62,
                                                aiOptimized: 0.71,
                                            },
                                            {
                                                type: "Education",
                                                traditional: 0.65,
                                                aiOptimized: 0.74,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="type" />
                                        <YAxis domain={[0.5, 0.9]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="traditional"
                                            name="Traditional Design"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="aiOptimized"
                                            name="AI-Optimized"
                                            fill="#3a86ff"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Room Optimization</CardTitle>
                                <CardDescription>
                                    Space utilization improvements through AI
                                    optimization
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            {
                                                iteration: 1,
                                                efficiency: 65,
                                                adaptability: 45,
                                                functionality: 58,
                                            },
                                            {
                                                iteration: 2,
                                                efficiency: 72,
                                                adaptability: 53,
                                                functionality: 64,
                                            },
                                            {
                                                iteration: 3,
                                                efficiency: 78,
                                                adaptability: 61,
                                                functionality: 72,
                                            },
                                            {
                                                iteration: 4,
                                                efficiency: 83,
                                                adaptability: 68,
                                                functionality: 77,
                                            },
                                            {
                                                iteration: 5,
                                                efficiency: 86,
                                                adaptability: 72,
                                                functionality: 81,
                                            },
                                            {
                                                iteration: 6,
                                                efficiency: 87,
                                                adaptability: 75,
                                                functionality: 83,
                                            },
                                            {
                                                iteration: 7,
                                                efficiency: 88,
                                                adaptability: 76,
                                                functionality: 85,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="iteration"
                                            label={{
                                                value: "Design Iteration",
                                                position: "insideBottom",
                                                offset: -5,
                                            }}
                                        />
                                        <YAxis
                                            label={{
                                                value: "Score (%)",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="efficiency"
                                            name="Space Efficiency"
                                            stroke="#4361ee"
                                            strokeWidth={2}
                                            activeDot={{ r: 8 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="adaptability"
                                            name="Adaptability"
                                            stroke="#3a86ff"
                                            strokeWidth={2}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="functionality"
                                            name="Functionality"
                                            stroke="#4cc9f0"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Sustainability Analytics */}
                <TabsContent value="sustainability" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Energy Performance</CardTitle>
                                <CardDescription>
                                    Energy use intensity by building type
                                    (kWh/m²/yr)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                type: "Residential",
                                                benchmark: 150,
                                                optimized: 95,
                                            },
                                            {
                                                type: "Office",
                                                benchmark: 220,
                                                optimized: 135,
                                            },
                                            {
                                                type: "Retail",
                                                benchmark: 250,
                                                optimized: 165,
                                            },
                                            {
                                                type: "Healthcare",
                                                benchmark: 320,
                                                optimized: 210,
                                            },
                                            {
                                                type: "Education",
                                                benchmark: 180,
                                                optimized: 115,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="type" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="benchmark"
                                            name="Industry Benchmark"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="optimized"
                                            name="AI-Optimized Design"
                                            fill="#3a86ff"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Daylight Performance</CardTitle>
                                <CardDescription>
                                    Spatial Daylight Autonomy (sDA) improvements
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={[
                                            {
                                                month: "Jan",
                                                traditional: 42,
                                                optimized: 68,
                                            },
                                            {
                                                month: "Feb",
                                                traditional: 48,
                                                optimized: 72,
                                            },
                                            {
                                                month: "Mar",
                                                traditional: 54,
                                                optimized: 76,
                                            },
                                            {
                                                month: "Apr",
                                                traditional: 61,
                                                optimized: 81,
                                            },
                                            {
                                                month: "May",
                                                traditional: 67,
                                                optimized: 84,
                                            },
                                            {
                                                month: "Jun",
                                                traditional: 72,
                                                optimized: 87,
                                            },
                                            {
                                                month: "Jul",
                                                traditional: 74,
                                                optimized: 88,
                                            },
                                            {
                                                month: "Aug",
                                                traditional: 71,
                                                optimized: 86,
                                            },
                                            {
                                                month: "Sep",
                                                traditional: 65,
                                                optimized: 82,
                                            },
                                            {
                                                month: "Oct",
                                                traditional: 58,
                                                optimized: 78,
                                            },
                                            {
                                                month: "Nov",
                                                traditional: 49,
                                                optimized: 73,
                                            },
                                            {
                                                month: "Dec",
                                                traditional: 44,
                                                optimized: 70,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis
                                            label={{
                                                value: "sDA (%)",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="traditional"
                                            name="Traditional Design"
                                            stroke="#4361ee"
                                            strokeWidth={2}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="optimized"
                                            name="AI-Optimized Design"
                                            stroke="#3a86ff"
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Sustainability Metrics</CardTitle>
                                <CardDescription>
                                    Performance across key environmental
                                    indicators
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                metric: "Energy Efficiency",
                                                score: 78,
                                                industry: 65,
                                                target: 85,
                                            },
                                            {
                                                metric: "Water Conservation",
                                                score: 72,
                                                industry: 58,
                                                target: 80,
                                            },
                                            {
                                                metric: "Material Selection",
                                                score: 65,
                                                industry: 60,
                                                target: 75,
                                            },
                                            {
                                                metric: "Indoor Air Quality",
                                                score: 82,
                                                industry: 70,
                                                target: 90,
                                            },
                                            {
                                                metric: "Thermal Comfort",
                                                score: 75,
                                                industry: 68,
                                                target: 82,
                                            },
                                            {
                                                metric: "Daylighting",
                                                score: 81,
                                                industry: 62,
                                                target: 88,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="metric" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="score"
                                            name="Current Score"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="industry"
                                            name="Industry Average"
                                            fill="#4cc9f0"
                                        />
                                        <Bar
                                            dataKey="target"
                                            name="Target Score"
                                            fill="#560bad"
                                            stroke="#560bad"
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Compliance Analytics */}
                <TabsContent value="compliance" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Building Code Compliance</CardTitle>
                                <CardDescription>
                                    Initial compliance rate by code category
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                category: "Structural",
                                                manual: 82,
                                                ai: 96,
                                            },
                                            {
                                                category: "Fire Safety",
                                                manual: 78,
                                                ai: 92,
                                            },
                                            {
                                                category: "Accessibility",
                                                manual: 75,
                                                ai: 94,
                                            },
                                            {
                                                category: "Egress",
                                                manual: 80,
                                                ai: 95,
                                            },
                                            {
                                                category: "Ventilation",
                                                manual: 84,
                                                ai: 97,
                                            },
                                            {
                                                category: "Energy",
                                                manual: 70,
                                                ai: 89,
                                            },
                                        ]}
                                        layout="vertical"
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 80,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            type="number"
                                            domain={[60, 100]}
                                        />
                                        <YAxis
                                            dataKey="category"
                                            type="category"
                                            width={80}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="manual"
                                            name="Manual Design"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="ai"
                                            name="AI-Assisted Design"
                                            fill="#3a86ff"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>Approval Times</CardTitle>
                                <CardDescription>
                                    Average days to obtain approvals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            {
                                                type: "Planning",
                                                traditional: 45,
                                                ai: 32,
                                            },
                                            {
                                                type: "Building",
                                                traditional: 38,
                                                ai: 21,
                                            },
                                            {
                                                type: "Fire",
                                                traditional: 28,
                                                ai: 18,
                                            },
                                            {
                                                type: "Environmental",
                                                traditional: 35,
                                                ai: 24,
                                            },
                                            {
                                                type: "Utilities",
                                                traditional: 21,
                                                ai: 16,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="type" />
                                        <YAxis
                                            label={{
                                                value: "Days",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Bar
                                            dataKey="traditional"
                                            name="Traditional Process"
                                            fill="#4361ee"
                                        />
                                        <Bar
                                            dataKey="ai"
                                            name="AI-Optimized Process"
                                            fill="#3a86ff"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Design Review Cycles</CardTitle>
                                <CardDescription>
                                    Number of review iterations before approval
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={[
                                            {
                                                complexity: "Very Low",
                                                traditional: 1.8,
                                                ai: 1.1,
                                            },
                                            {
                                                complexity: "Low",
                                                traditional: 2.4,
                                                ai: 1.3,
                                            },
                                            {
                                                complexity: "Medium",
                                                traditional: 3.6,
                                                ai: 1.7,
                                            },
                                            {
                                                complexity: "High",
                                                traditional: 4.8,
                                                ai: 2.4,
                                            },
                                            {
                                                complexity: "Very High",
                                                traditional: 5.9,
                                                ai: 2.8,
                                            },
                                            {
                                                complexity: "Complex",
                                                traditional: 6.5,
                                                ai: 3.2,
                                            },
                                        ]}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="complexity" />
                                        <YAxis
                                            label={{
                                                value: "Review Cycles",
                                                angle: -90,
                                                position: "insideLeft",
                                            }}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="traditional"
                                            name="Traditional Design Process"
                                            fill="#4361ee"
                                            fillOpacity={0.6}
                                            stroke="#4361ee"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="ai"
                                            name="AI-Assisted Design Process"
                                            fill="#3a86ff"
                                            fillOpacity={0.6}
                                            stroke="#3a86ff"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
