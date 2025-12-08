import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Package,
  Save,
  IndianRupee,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const style = { "--sidebar-width": "16rem" };
  const { toast } = useToast();
  const [gymName, setGymName] = useState("FitPro");
  const [gymEmail, setGymEmail] = useState("admin@fitpro.com");
  const [gymPhone, setGymPhone] = useState("+91 1234567890");
  const [gymAddress, setGymAddress] = useState("123 Fitness Street, Mumbai, India");
  const [isSaving, setIsSaving] = useState(false);

  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/settings", {
        gymName,
        gymEmail,
        gymPhone,
        gymAddress,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin settings saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  // Define the 3 packages with their respective pricing for 4, 8, and 12 weeks
  const packages = [
    {
      id: "fit-basic",
      name: "Fit Basic",
      description: "Live Group Training + Personalized Diet + Weekly 1 Check-in + WhatsApp Support",
      features: ["Live group training", "Personalized Diet", "Weekly 1 check-in", "WhatsApp support"],
      color: "bg-blue-500",
      weeks: [
        { duration: 4, price: 2500 },
        { duration: 8, price: 4800 },
        { duration: 12, price: 7200 }
      ]
    },
    {
      id: "pro-transformation",
      name: "Pro Transformation",
      description: "Live Group Training + Personalized Diet + Weekly 2 Check-ins + WhatsApp Support + WhatsApp Community",
      features: ["Live group training", "Personalized Diet", "Weekly 2 check-ins", "WhatsApp support", "WhatsApp community"],
      color: "bg-orange-500",
      weeks: [
        { duration: 4, price: 5000 },
        { duration: 8, price: 9500 },
        { duration: 12, price: 14000 }
      ]
    },
    {
      id: "elite-athlete",
      name: "Elite Athlete",
      description: "1:1 Personal Training + Personalized Diet + Weekly 2 Check-ins + WhatsApp Support + WhatsApp Community",
      features: ["1:1 Personal Training", "Personalized Diet", "Weekly 2 check-ins", "WhatsApp support", "WhatsApp community"],
      color: "bg-green-500",
      weeks: [
        { duration: 4, price: 10000 },
        { duration: 8, price: 18500 },
        { duration: 12, price: 26000 }
      ]
    }
  ];

  const handleSaveGeneralSettings = () => {
    setIsSaving(true);
    saveSettingsMutation.mutate();
    setIsSaving(false);
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-display font-bold tracking-tight">Settings</h1>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <div className="max-w-6xl mx-auto space-y-6">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="general" data-testid="tab-general">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Settings
                  </TabsTrigger>
                  <TabsTrigger value="packages" data-testid="tab-packages">
                    <Package className="w-4 h-4 mr-2" />
                    Package Pricing
                  </TabsTrigger>
                </TabsList>

                {/* Admin Settings Tab */}
                <TabsContent value="general">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          General Settings
                        </CardTitle>
                        <CardDescription>
                          Configure your gym's basic information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gymName" data-testid="label-gym-name">Gym Name</Label>
                            <Input
                              id="gymName"
                              value={gymName}
                              onChange={(e) => setGymName(e.target.value)}
                              placeholder="Enter gym name"
                              data-testid="input-gym-name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gymEmail" data-testid="label-gym-email">Contact Email</Label>
                            <Input
                              id="gymEmail"
                              type="email"
                              value={gymEmail}
                              onChange={(e) => setGymEmail(e.target.value)}
                              placeholder="Enter contact email"
                              data-testid="input-gym-email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gymPhone" data-testid="label-gym-phone">Contact Phone</Label>
                            <Input
                              id="gymPhone"
                              value={gymPhone}
                              onChange={(e) => setGymPhone(e.target.value)}
                              placeholder="Enter contact phone"
                              data-testid="input-gym-phone"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gymAddress" data-testid="label-gym-address">Gym Address</Label>
                            <Input
                              id="gymAddress"
                              value={gymAddress}
                              onChange={(e) => setGymAddress(e.target.value)}
                              placeholder="Enter gym address"
                              data-testid="input-gym-address"
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={handleSaveGeneralSettings}
                          data-testid="button-save-general"
                          className="w-full md:w-auto"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Settings
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Package Pricing Tab */}
                <TabsContent value="packages">
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold">Package Pricing</h2>
                      <p className="text-muted-foreground mt-1">
                        Configure pricing for all membership packages across different durations
                      </p>
                    </div>

                    <div className="grid gap-6">
                      {packages.map((pkg) => (
                        <Card key={pkg.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full ${pkg.color}`} />
                                  {pkg.name}
                                </CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                              </div>
                              <Badge variant="outline" className="mt-1">
                                {pkg.id === "premium" ? "Popular" : pkg.id === "platinum" ? "VIP" : "Standard"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-6">
                              {/* Features */}
                              <div>
                                <h4 className="font-medium mb-3">Features Included:</h4>
                                <div className="grid gap-2">
                                  {pkg.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <Separator />

                              {/* Pricing Grid */}
                              <div>
                                <h4 className="font-medium mb-4">Pricing by Duration:</h4>
                                <div className="grid md:grid-cols-3 gap-4">
                                  {pkg.weeks.map((week) => (
                                    <div key={week.duration} className="border rounded-md p-4 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{week.duration} Weeks</span>
                                        <Badge variant="secondary">{week.duration} wks</Badge>
                                      </div>
                                      <div className="flex items-baseline gap-1">
                                        <IndianRupee className="w-4 h-4 mt-1" />
                                        <span className="text-3xl font-bold">{week.price.toLocaleString('en-IN')}</span>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {(week.price / week.duration).toFixed(0)} per week
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <Card className="bg-muted/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Pricing Note</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          These package prices are reference pricing for 4, 8, and 12-week durations. 
                          To modify pricing or create custom packages, use the Client Management section 
                          where you can assign packages to individual clients with custom pricing and durations.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
