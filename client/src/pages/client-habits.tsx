import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ClientHeader } from "@/components/client-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Flame } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ClientHabits() {
  const { toast } = useToast();

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const user = userData?.user;
  const client = userData?.client;
  const packageName = user?.packageId?.name || user?.packageName || client?.packageId?.name || "";
  
  // Get clientId from user object or client object
  const clientId = user?.clientId || client?._id;
  
  console.log('[ClientHabits] User data:', { 
    userId: user?._id, 
    clientId, 
    role: user?.role,
    hasClient: !!client 
  });

  // Fetch habits with proper authentication - use clientId directly
  const { data: habits = [], isLoading: habitsLoading, refetch: refetchHabits } = useQuery<any[]>({
    queryKey: ["/api/habits/client", clientId],
    queryFn: async () => {
      if (!clientId) {
        console.log('[ClientHabits] No clientId available, skipping habits fetch');
        return [];
      }
      console.log('[ClientHabits] Fetching habits for clientId:', clientId);
      try {
        const res = await apiRequest("GET", `/api/habits/client/${clientId}`);
        const data = await res.json();
        console.log('[ClientHabits] Habits fetched:', Array.isArray(data) ? data.length : 0, 'habits', data);
        return Array.isArray(data) ? data : [];
      } catch (error: any) {
        console.error('[ClientHabits] Failed to fetch habits:', error.message);
        return [];
      }
    },
    enabled: !!clientId,
    staleTime: 0,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  const isLoading = userLoading || (!!clientId && habitsLoading);

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
      // Refetch to get updated habit state
      if (clientId) {
        queryClient.invalidateQueries({ queryKey: ["/api/habits/client", clientId] });
      }
      // Also refetch immediately
      refetchHabits();
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
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader currentPage="habits" packageName={packageName} />

      <div className="max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3">My Habits</h1>
          <p className="text-lg text-muted-foreground">Track your daily habits assigned by your trainer</p>
        </div>

        {/* Progress Summary */}
        {habits.length > 0 && (
          <Card className="mb-8 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 overflow-hidden">
            <CardContent className="pt-8 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Today's Progress</p>
                  <div className="flex items-baseline gap-3">
                    <p className="text-5xl font-bold text-primary">{completedCount}/{totalCount}</p>
                    <span className="text-lg text-muted-foreground">habits</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-slate-900 shadow-md">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                        {progressPercentage}%
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground mt-1">Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Habits List */}
        {isLoading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin"></div>
                <p className="text-muted-foreground">Loading your habits...</p>
              </div>
            </CardContent>
          </Card>
        ) : habits.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <Flame className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No habits assigned yet. Contact your trainer to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {habits.map((habit: any) => {
              const isCompleted = habit.completed || false;

              return (
                <Card 
                  key={habit._id} 
                  className={`transition-all duration-300 cursor-pointer hover-elevate ${
                    isCompleted 
                      ? "border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-sm" 
                      : "hover:shadow-md"
                  }`} 
                  data-testid={`card-habit-${habit._id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg truncate">{habit.name}</p>
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />}
                        </div>
                        {habit.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{habit.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs capitalize">{habit.frequency}</Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => toggleHabit(habit._id, isCompleted)}
                        disabled={markHabitMutation.isPending}
                        variant={isCompleted ? "default" : "outline"}
                        className={`gap-2 whitespace-nowrap flex-shrink-0 transition-all ${
                          isCompleted ? "bg-green-600 hover:bg-green-700 dark:bg-green-700" : ""
                        }`}
                        data-testid={`button-mark-habit-${habit._id}`}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${isCompleted ? "" : "opacity-50"}`} />
                        {isCompleted ? "Done" : "Mark Done"}
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
