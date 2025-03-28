"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    BellRing,
    BrainCircuit,
    CreditCard,
    Lock,
    PaletteIcon,
    Save,
    User,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");

    // Profile settings
    const [profile, setProfile] = useState({
        name: "Alice Chen",
        email: "alice.chen@example.com",
        company: "Architectural Innovations",
        bio: "Lead architect specializing in sustainable design",
    });

    // Appearance settings
    const [appearance, setAppearance] = useState({
        theme: "system",
        reducedMotion: false,
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        email: true,
        app: true,
        projectUpdates: true,
        teamMessages: true,
    });

    // AI settings
    const [aiSettings, setAiSettings] = useState({
        autoSuggestions: true,
        model: "standard",
        sustainabilityCheck: true,
    });

    // Handle form submission
    const handleSave = () => {
        toast({
            title: "Settings saved",
            description: "Your preferences have been updated successfully.",
        });
    };

    return (
        <div className="container mx-auto py-6 px-4 md:px-6">
            <div className="flex flex-col space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account preferences
                    </p>
                </div>

                <Tabs
                    defaultValue={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid grid-cols-4 w-full max-w-md">
                        <TabsTrigger value="account">
                            <User className="h-4 w-4 mr-2" />
                            Account
                        </TabsTrigger>
                        <TabsTrigger value="appearance">
                            <PaletteIcon className="h-4 w-4 mr-2" />
                            Appearance
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <BellRing className="h-4 w-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="ai">
                            <BrainCircuit className="h-4 w-4 mr-2" />
                            AI Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Account Settings */}
                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4 pb-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src="/placeholder.svg?height=40&width=40" />
                                        <AvatarFallback>AC</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" size="sm">
                                        Change Photo
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                email: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={profile.company}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                company: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        rows={3}
                                        value={profile.bio}
                                        onChange={(e) =>
                                            setProfile({
                                                ...profile,
                                                bio: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Appearance Settings */}
                    <TabsContent value="appearance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PaletteIcon className="h-5 w-5" />
                                    Display Options
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Theme</Label>
                                    <Select
                                        value={appearance.theme}
                                        onValueChange={(value) =>
                                            setAppearance({
                                                ...appearance,
                                                theme: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="theme">
                                            <SelectValue placeholder="Select theme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">
                                                Light
                                            </SelectItem>
                                            <SelectItem value="dark">
                                                Dark
                                            </SelectItem>
                                            <SelectItem value="system">
                                                System Default
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Reduced Motion</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Minimize animations throughout the
                                            interface
                                        </p>
                                    </div>
                                    <Switch
                                        checked={appearance.reducedMotion}
                                        onCheckedChange={(checked) =>
                                            setAppearance({
                                                ...appearance,
                                                reducedMotion: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notification Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BellRing className="h-5 w-5" />
                                    Notification Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Email Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Receive updates via email
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.email}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                email: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>In-App Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show notifications within the
                                            application
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.app}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                app: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Project Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about changes to your
                                            projects
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.projectUpdates}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                projectUpdates: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Team Messages</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notifications about team
                                            communications
                                        </p>
                                    </div>
                                    <Switch
                                        checked={notifications.teamMessages}
                                        onCheckedChange={(checked) =>
                                            setNotifications({
                                                ...notifications,
                                                teamMessages: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Settings */}
                    <TabsContent value="ai" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BrainCircuit className="h-5 w-5" />
                                    AI Preferences
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="model">AI Model</Label>
                                    <Select
                                        value={aiSettings.model}
                                        onValueChange={(value) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                model: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger id="model">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">
                                                Basic
                                            </SelectItem>
                                            <SelectItem value="standard">
                                                Standard
                                            </SelectItem>
                                            <SelectItem value="professional">
                                                Professional
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        Higher tier models use more AI credits
                                        but provide more detailed suggestions
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-Suggestions</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Allow AI to suggest improvements to
                                            your designs
                                        </p>
                                    </div>
                                    <Switch
                                        checked={aiSettings.autoSuggestions}
                                        onCheckedChange={(checked) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                autoSuggestions: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Sustainability Checker</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Analyze designs for sustainability
                                            metrics
                                        </p>
                                    </div>
                                    <Switch
                                        checked={aiSettings.sustainabilityCheck}
                                        onCheckedChange={(checked) =>
                                            setAiSettings({
                                                ...aiSettings,
                                                sustainabilityCheck: checked,
                                            })
                                        }
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSave}>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
