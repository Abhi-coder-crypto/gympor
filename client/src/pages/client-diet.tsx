import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ClientHeader } from "@/components/client-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MobileNavigation } from "@/components/mobile-navigation";
import {
  UtensilsCrossed,
  ShoppingCart,
  AlertTriangle,
  Download,
  Clock,
  ChefHat,
} from "lucide-react";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Dish {
  name: string;
  quantity?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface Meal {
  time?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  dishes?: Dish[];
  name?: string;
}

interface DayMeals {
  [mealType: string]: Meal;
}

interface DietPlan {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  targetCalories: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  meals: Record<string, DayMeals>;
  createdAt: string;
  updatedAt?: string;
}

export default function ClientDiet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showGroceryList, setShowGroceryList] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("clientId");
    if (!id) {
      setLocation("/client-access");
    } else {
      setClientId(id);
    }
  }, [setLocation]);

  const { data: dietPlans = [], isLoading, error } = useQuery<DietPlan[]>({
    queryKey: ["/api/diet-plans", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const url = `/api/diet-plans?clientId=${clientId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch diet plans");
      }
      return response.json();
    },
    enabled: !!clientId,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const currentPlan = dietPlans?.[0];

  const getMealsForDay = (day: string): DayMeals => {
    return currentPlan?.meals?.[day] || {};
  };

  const getMealCount = (day: string): number => {
    const dayMeals = getMealsForDay(day);
    return Object.keys(dayMeals).length;
  };

  const getDayCalories = (day: string): number => {
    const dayMeals = getMealsForDay(day);
    let total = 0;
    Object.values(dayMeals).forEach((meal: Meal) => {
      total += meal?.calories || 0;
    });
    return total;
  };

  const generateGroceryListForDay = (day: string): string[] => {
    const items: string[] = [];
    const dayMeals = getMealsForDay(day);
    
    Object.values(dayMeals).forEach((meal: Meal) => {
      if (meal?.dishes && Array.isArray(meal.dishes)) {
        meal.dishes.forEach((dish: Dish) => {
          if (dish.name) {
            const itemText = dish.quantity ? `${dish.name} - ${dish.quantity}` : dish.name;
            if (!items.includes(itemText)) {
              items.push(itemText);
            }
          }
        });
      }
    });
    
    return items;
  };

  const downloadGroceryList = () => {
    if (!selectedDay) return;
    
    const items = generateGroceryListForDay(selectedDay);
    const content = `GROCERY LIST - ${selectedDay.toUpperCase()}
${currentPlan?.name || "Diet Plan"}
Generated: ${new Date().toLocaleDateString()}
${"=".repeat(40)}

${items.length > 0 ? items.map((item, idx) => `${idx + 1}. ${item}`).join("\n") : "No items for this day"}

${"=".repeat(40)}
Total Items: ${items.length}
`;
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grocery-list-${selectedDay.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: `Grocery list for ${selectedDay} downloaded successfully`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your diet plan...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No Diet Plan Assigned</h2>
          <p className="text-muted-foreground">Contact your trainer to get a personalized diet plan</p>
          <Button onClick={() => setLocation("/client-dashboard")} className="mt-4" data-testid="button-back-dashboard">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const selectedDayMeals = selectedDay ? getMealsForDay(selectedDay) : {};
  const selectedDayItems = selectedDay ? generateGroceryListForDay(selectedDay) : [];

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      <MobileNavigation />

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2" data-testid="text-plan-name">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            {currentPlan.name}
          </h1>
          {currentPlan.description && (
            <p className="text-muted-foreground text-sm">{currentPlan.description}</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Weekly Diet Plan</h2>
          <p className="text-sm text-muted-foreground mb-4">Click on a day to view meals and grocery list</p>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {DAYS_OF_WEEK.slice(0, 3).map((day) => (
              <DayCard
                key={day}
                day={day}
                mealCount={getMealCount(day)}
                calories={getDayCalories(day)}
                isSelected={selectedDay === day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-3">
            {DAYS_OF_WEEK.slice(3, 6).map((day) => (
              <DayCard
                key={day}
                day={day}
                mealCount={getMealCount(day)}
                calories={getDayCalories(day)}
                isSelected={selectedDay === day}
                onClick={() => setSelectedDay(selectedDay === day ? null : day)}
              />
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <DayCard
              day="Sunday"
              mealCount={getMealCount("Sunday")}
              calories={getDayCalories("Sunday")}
              isSelected={selectedDay === "Sunday"}
              onClick={() => setSelectedDay(selectedDay === "Sunday" ? null : "Sunday")}
            />
            <div></div>
            <div></div>
          </div>
        </div>

        {selectedDay && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedDay}'s Meals</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGroceryList(true)}
                data-testid="button-view-grocery"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Grocery List ({selectedDayItems.length})
              </Button>
            </div>

            {Object.keys(selectedDayMeals).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(selectedDayMeals).map(([mealType, meal]) => (
                  <Card key={mealType} data-testid={`card-meal-${mealType}`}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="capitalize text-base flex items-center gap-2">
                          <ChefHat className="h-4 w-4" />
                          {mealType}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {meal?.time && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {meal.time}
                            </Badge>
                          )}
                          <Badge variant="secondary">{meal?.calories || 0} cal</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {meal?.dishes && meal.dishes.length > 0 ? (
                        <ul className="space-y-2">
                          {meal.dishes.map((dish: Dish, idx: number) => (
                            <li key={idx} className="flex items-start justify-between text-sm py-1 border-b last:border-0">
                              <span className="font-medium">{dish.name}</span>
                              <span className="text-muted-foreground">{dish.quantity || "1 serving"}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No dishes specified</p>
                      )}

                      {(meal?.protein || meal?.carbs || meal?.fats) && (
                        <div className="flex gap-4 mt-3 pt-3 border-t text-xs">
                          <span><strong>P:</strong> {meal?.protein || 0}g</span>
                          <span><strong>C:</strong> {meal?.carbs || 0}g</span>
                          <span><strong>F:</strong> {meal?.fats || 0}g</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No meals planned for {selectedDay}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <Dialog open={showGroceryList} onOpenChange={setShowGroceryList}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Grocery List - {selectedDay}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {selectedDayItems.length > 0 ? (
              <ul className="space-y-2">
                {selectedDayItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="w-5 h-5 rounded border border-muted-foreground flex-shrink-0"></div>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">No grocery items for {selectedDay}</p>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button 
              onClick={downloadGroceryList} 
              disabled={selectedDayItems.length === 0}
              data-testid="button-download-grocery"
            >
              <Download className="h-4 w-4 mr-2" />
              Download List
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DayCardProps {
  day: string;
  mealCount: number;
  calories: number;
  isSelected: boolean;
  onClick: () => void;
}

function DayCard({ day, mealCount, calories, isSelected, onClick }: DayCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover-elevate ${isSelected ? "ring-2 ring-primary bg-primary/5" : ""}`}
      onClick={onClick}
      data-testid={`card-day-${day.toLowerCase()}`}
    >
      <CardContent className="p-4 text-center">
        <p className="font-semibold text-sm mb-1">{day.slice(0, 3)}</p>
        <p className="text-xs text-muted-foreground">{mealCount} meals</p>
        {calories > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{calories} cal</p>
        )}
      </CardContent>
    </Card>
  );
}
