import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";

export default function ClientHabits() {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch user data
  const { data: userData } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const user = userData?.user;
  const packageName = user?.packageId?.name || user?.packageName || "";

  useEffect(() => {
    if (user?.clientId) {
      console.log('Setting clientId:', user.clientId);
      setClientId(user.clientId);
    }
  }, [user?.clientId]);

  // Fetch habits with proper authentication
  const { data: habits = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/habits/client", clientId],
    queryFn: async () => {
      if (!clientId) {
        console.log('No clientId available, skipping habits fetch');
        return [];
      }
      console.log('Fetching habits for clientId:', clientId);
      try {
        const res = await apiRequest("GET", `/api/habits/client/${clientId}`);
        const data = await res.json();
        console.log('Habits fetched successfully:', Array.isArray(data) ? data.length : 0, 'habits');
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('Failed to fetch habits:', error.message);
        return [];
      }
    },
    enabled: !!clientId,
    staleTime: 0,
    refetchInterval: 30000,
  });

  // Mark habit done mutation
  const markHabitMutation = useMutation({
    mutationFn: async ({ habitId, completed }: { habitId: string; completed: boolean }) => {
      const today = new Date();
      return apiRequest("POST", `/api/habits/${habitId}/log`, {
        completed,
        date: today,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits", clientId] });
      toast({
        title: "Success",
        description: "Habit status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
    },
  });

  const toggleHabit = (habitId: string, currentStatus: boolean) => {
    markHabitMutation.mutate({
      habitId,
      completed: !currentStatus,
    });
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader currentPage="habits" packageName={packageName} />

      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Habits</h1>
          <p className="text-muted-foreground">Track your daily habits assigned by your trainer</p>
        </div>

        {/* Progress Summary */}
        {habits.length > 0 && (
          <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Progress</p>
                  <p className="text-3xl font-bold">
                    {completedCount}/{totalCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Habits List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading your habits...</p>
            </CardContent>
          </Card>
        ) : habits.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No habits assigned yet. Contact your trainer to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {habits.map((habit: any) => {
              const isCompleted = habit.completed || false;

              return (
                <Card key={habit._id} className={isCompleted ? "border-green-200 bg-green-50 dark:bg-green-950/20" : ""} data-testid={`card-habit-${habit._id}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{habit.name}</p>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
                        )}
                        <Badge className="mt-2">{habit.frequency}</Badge>
                      </div>
                      <Button
                        onClick={() => toggleHabit(habit._id, isCompleted)}
                        disabled={markHabitMutation.isPending}
                        variant={isCompleted ? "default" : "outline"}
                        className="gap-2 whitespace-nowrap"
                        data-testid={`button-mark-habit-${habit._id}`}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${isCompleted ? "" : "opacity-50"}`} />
                        {isCompleted ? "Done Today" : "Mark Today Done"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
