import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ClientHabits() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientId, setClientId] = useState<string | null>(null);

  // Fetch user and client data from backend
  const { data: userData, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });

  const client = userData?.client;
  const packageName = client?.packageId?.name || client?.packageName || "";

  useEffect(() => {
    if (client?._id) {
      setClientId(client._id);
    }
  }, [client?._id]);

  // Get habits for client - directly use fetch instead of query issues
  const [habits, setHabits] = useState<any[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [habitsError, setHabitsError] = useState<any>(null);

  useEffect(() => {
    if (!clientId) return;
    
    const fetchHabits = async () => {
      setHabitsLoading(true);
      setHabitsError(null);
      try {
        const response = await fetch(`/api/habits/client/${clientId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHabits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch habits:', error);
        setHabitsError(error);
      } finally {
        setHabitsLoading(false);
      }
    };

    fetchHabits();
  }, [clientId]);

  // If not authenticated yet, show empty page (don't wait for loading)
  if (!client) {
    return null;
  }

  // Get today's logs
  const todayLogs = habits.map((habit: any) => ({
    habitId: habit._id,
    date: new Date(),
    completed: false,
    _id: `temp-${habit._id}`,
  }));

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
      queryClient.invalidateQueries({ queryKey: ["/api/habits/client", clientId] });
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

  const completedCount = todayLogs.filter((l: any) => l.completed).length;
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
        {habits.length === 0 ? (
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
              const todayLog = todayLogs.find((l: any) => l.habitId === habit._id);
              const isCompleted = todayLog?.completed || false;

              return (
                <Card key={habit._id} className={isCompleted ? "border-green-200 bg-green-50 dark:bg-green-950/20" : ""}>
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
