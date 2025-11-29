import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, CheckCircle2, XCircle } from "lucide-react";

interface ProgressSidebarProps {
  workoutDays: Array<{
    day: string;
    completed: boolean;
  }>;
  weightCurrent: number;
  weightTarget: number;
  weightInitial: number;
  onUpdateGoals?: () => void;
}

export function ProgressSidebar({
  workoutDays,
  weightCurrent,
  weightTarget,
  weightInitial,
  onUpdateGoals,
}: ProgressSidebarProps) {
  const completedDays = workoutDays.filter(d => d.completed).length;
  const totalDays = workoutDays.length;
  const sessionsProgress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
  
  // Calculate weight progress based on initial and target
  const weightProgress = weightInitial && weightTarget && weightInitial !== weightTarget
    ? Math.max(0, Math.min(100, ((weightInitial - weightCurrent) / (weightInitial - weightTarget)) * 100))
    : 0;
  const weightToGo = Math.abs(weightTarget - weightCurrent);

  return (
    <Card className="hover-elevate border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-2xl font-bold text-foreground">Your Progress</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">Track your weekly performance and goals</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* This Week's Workouts - Simple */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-sm">Weekly Workouts</h3>
            </div>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {completedDays} / {totalDays} sessions
            </span>
          </div>
          
          {/* Workout Days Grid - Circles from assignment date */}
          <div className="flex justify-between gap-2">
            {workoutDays.map((dayData) => (
              <div key={dayData.day} className="flex flex-col items-center">
                <button
                  className={`w-12 h-12 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center ${
                    dayData.completed
                      ? "bg-green-500 text-white shadow-md hover:shadow-lg"
                      : "bg-red-500 text-white shadow-md hover:shadow-lg"
                  }`}
                  data-testid={`workout-day-${dayData.day.toLowerCase()}`}
                >
                  {dayData.day}
                </button>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="pt-2">
            <Progress
              value={sessionsProgress}
              className="h-2.5"
              data-testid="progress-workouts"
            />
          </div>
        </div>

        {/* Weight Goal - Enhanced */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-sm">Weight Goal</h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">
                {weightCurrent} / {weightTarget} lbs
              </p>
              <p className="text-xs text-muted-foreground">
                {weightToGo} lbs to go
              </p>
            </div>
          </div>

          {/* Weight Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={Math.round(weightProgress)}
              className="h-2.5"
              data-testid="progress-weight"
            />
            <p className="text-xs text-muted-foreground text-right">{Math.round(weightProgress)}% progress</p>
          </div>
        </div>

        {/* Update Goals Button */}
        <Button
          variant="default"
          size="sm"
          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          onClick={onUpdateGoals}
          data-testid="button-update-goals"
        >
          Update Goals
        </Button>
      </CardContent>
    </Card>
  );
}
