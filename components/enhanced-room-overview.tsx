"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bath,
    BedDouble,
    ChefHat,
    Columns,
    Couch,
    Info,
    Ruler,
    SquareFootage,
} from "lucide-react";

// Room abbreviations for professional display
const ROOM_ABBREVIATIONS: { [key: string]: string } = {
    kitchen: "KIT",
    bathroom: "BTH",
    bedroom: "BR",
    living: "LIV",
    dining: "DIN",
    hallway: "HALL",
    patio: "PAT",
    storage: "STOR",
    closet: "CL",
    utility: "UTIL",
    entry: "ENTR",
    garage: "GAR",
    office: "OFF",
    study: "STU",
    laundry: "LNDRY",
};

// Room type icons
const ROOM_ICONS: { [key: string]: React.ReactNode } = {
    kitchen: <ChefHat className="h-4 w-4" />,
    bathroom: <Bath className="h-4 w-4" />,
    bedroom: <BedDouble className="h-4 w-4" />,
    living: <Couch className="h-4 w-4" />,
    dining: <Columns className="h-4 w-4" />,
    default: <SquareFootage className="h-4 w-4" />,
};

interface Room {
    name: string;
    type?: string;
    width: number;
    length: number;
    height: number;
    x: number;
    y: number;
    z: number;
    connected_to?: string[];
}

interface ModelData {
    rooms: Room[];
    windows?: any[];
    doors?: any[];
}

interface EnhancedRoomOverviewProps {
    modelData: ModelData;
    isMetric?: boolean;
}

export function EnhancedRoomOverview({
    modelData,
    isMetric = true,
}: EnhancedRoomOverviewProps) {
    const [selectedTab, setSelectedTab] = useState("summary");

    // Calculate total floor area
    const totalArea = modelData.rooms.reduce(
        (sum, room) => sum + room.width * room.length,
        0
    );

    // Identify room type from name or type attribute
    const identifyRoomType = (room: Room): string => {
        const roomType = room.type?.toLowerCase() || "";
        if (roomType && Object.keys(ROOM_ABBREVIATIONS).includes(roomType)) {
            return roomType;
        }

        const roomName = room.name.toLowerCase();
        for (const type of Object.keys(ROOM_ABBREVIATIONS)) {
            if (roomName.includes(type)) {
                return type;
            }
        }

        // Handle special cases
        if (roomName.includes("bed")) return "bedroom";
        if (roomName.includes("bath")) return "bathroom";
        if (roomName.includes("wic")) return "closet";
        if (roomName.includes("kit")) return "kitchen";
        if (roomName.includes("din")) return "dining";
        if (roomName.includes("liv")) return "living";

        return "default";
    };

    // Get room icon
    const getRoomIcon = (roomType: string) => {
        return ROOM_ICONS[roomType] || ROOM_ICONS.default;
    };

    // Calculate room data with proper formatting
    const getRoomData = (room: Room) => {
        const area = room.width * room.length;

        if (isMetric) {
            return {
                area,
                formattedArea: `${area.toFixed(1)} m²`,
                dimensions: `${room.width.toFixed(1)}m × ${room.length.toFixed(
                    1
                )}m × ${room.height.toFixed(1)}m`,
            };
        } else {
            // Convert to imperial (sq ft)
            const areaInSqFt = area * 10.764;
            const widthInFt = room.width * 3.281;
            const lengthInFt = room.length * 3.281;
            const heightInFt = room.height * 3.281;

            return {
                area: areaInSqFt,
                formattedArea: `${areaInSqFt.toFixed(0)} sq ft`,
                dimensions: `${widthInFt.toFixed(1)}' × ${lengthInFt.toFixed(
                    1
                )}' × ${heightInFt.toFixed(1)}'`,
            };
        }
    };

    return (
        <Card className="w-full h-full overflow-hidden flex flex-col">
            <CardHeader className="py-2 px-4 border-b">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Architectural Overview
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {isMetric ? "Metric" : "Imperial"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-grow p-0 overflow-auto">
                <Tabs
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                    className="w-full h-full"
                >
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="summary" className="text-xs">
                            <BarChart className="h-3.5 w-3.5 mr-1" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="details" className="text-xs">
                            <Ruler className="h-3.5 w-3.5 mr-1" />
                            Room Details
                        </TabsTrigger>
                        <TabsTrigger value="connections" className="text-xs">
                            <SquareFootage className="h-3.5 w-3.5 mr-1" />
                            Layout
                        </TabsTrigger>
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent
                        value="summary"
                        className="p-4 h-full overflow-auto"
                    >
                        <div className="space-y-4">
                            <div className="border rounded-md p-3">
                                <h3 className="text-sm font-medium mb-2">
                                    Total Floor Area
                                </h3>
                                <p className="text-2xl font-bold">
                                    {isMetric
                                        ? `${totalArea.toFixed(1)} m²`
                                        : `${(totalArea * 10.764).toFixed(
                                              0
                                          )} sq ft`}
                                </p>
                            </div>

                            <div className="border rounded-md p-3">
                                <h3 className="text-sm font-medium mb-2">
                                    Room Count
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {/* Group rooms by type and count them */}
                                    {Object.entries(
                                        modelData.rooms.reduce((acc, room) => {
                                            const type = identifyRoomType(room);
                                            acc[type] = (acc[type] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([type, count]) => (
                                        <Badge
                                            key={type}
                                            variant="secondary"
                                            className="flex items-center"
                                        >
                                            {getRoomIcon(type)}
                                            <span className="ml-1">
                                                {type}: {count}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="border rounded-md p-3">
                                <h3 className="text-sm font-medium mb-2">
                                    Windows & Doors
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">
                                            {modelData.windows?.length || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Windows
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">
                                            {modelData.doors?.length || 0}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Doors
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Room Details Tab */}
                    <TabsContent
                        value="details"
                        className="h-full overflow-auto"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Dimensions</TableHead>
                                    <TableHead className="text-right">
                                        Area
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modelData.rooms.map((room, index) => {
                                    const roomData = getRoomData(room);
                                    const roomType = identifyRoomType(room);
                                    const abbr =
                                        ROOM_ABBREVIATIONS[roomType] || "RM";

                                    return (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium flex items-center">
                                                {getRoomIcon(roomType)}
                                                <span className="ml-2">
                                                    {room.name}
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        ({abbr}-{100 + index})
                                                    </span>
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {roomData.dimensions}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {roomData.formattedArea}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    {/* Connections Tab */}
                    <TabsContent
                        value="connections"
                        className="p-4 h-full overflow-auto"
                    >
                        <div className="space-y-4">
                            {modelData.rooms.map((room, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-3"
                                >
                                    <h3 className="text-sm font-medium flex items-center">
                                        {getRoomIcon(identifyRoomType(room))}
                                        <span className="ml-2">
                                            {room.name}
                                        </span>
                                    </h3>

                                    {room.connected_to &&
                                    room.connected_to.length > 0 ? (
                                        <div className="mt-2">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                Connected to:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {room.connected_to.map(
                                                    (connectedRoom, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {connectedRoom}
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground mt-2">
                                            No connections
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
