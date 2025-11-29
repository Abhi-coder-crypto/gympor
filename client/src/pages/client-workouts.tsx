import { ClientHeader } from "@/components/client-header";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ContactTrainerDialog } from "@/components/contact-trainer-dialog";
import {
  Dumbbell,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Exercise {
  name: string;
  sets?: number;
  reps?: string | number;
  weight?: number;
  duration?: number;
  restTime?: number;
  notes?: string;
  difficulty?: string;
  intensity?: string;
}

interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  exercises: Record<string, Exercise[]>;
  difficulty: string;
  durationWeeks: number;
  goal?: string;
}

interface DietPlan {
  _id: string;
  meals: Array<{ calories?: number; weekNumber?: number }>;
  targetCalories?: number;
}

interface ClientData {
  weight?: number;
  age?: number;
  gender?: string;
  goal?: string;
}

const DAYS_OF_WEEK = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export default function ClientWorkouts() {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [contactTrainerOpen, setContactTrainerOpen] = useState(false);

  const { data: assignedWorkouts = [], isLoading: isLoadingWorkouts, isError, error } = useQuery<WorkoutPlan[]>({
    queryKey: ['/api/workout-plans'],
    staleTime: 0,
    refetchInterval: 10000,
  });

  const { data: dietPlans = [] } = useQuery<DietPlan[]>({
    queryKey: ['/api/diet-plans'],
    staleTime: 0,
    refetchInterval: 10000,
  });

  const { data: clientData } = useQuery<ClientData>({
    queryKey: ['/api/auth/me'],
    select: (data: any) => ({
      weight: data.user?.weight,
      age: data.user?.age,
      gender: data.user?.gender,
      goal: data.user?.goal,
    }),
    staleTime: 0,
    refetchInterval: 10000,
  });

  const firstWorkout = assignedWorkouts && assignedWorkouts.length > 0 ? assignedWorkouts[0] : null;

  const getAllUniqueDays = (): string[] => {
    if (!firstWorkout?.exercises) return [];
    const daysSet = new Set<string>();
    
    Object.keys(firstWorkout.exercises).forEach(key => {
      const days = key.split(/[/,\s]+/).map(d => d.trim()).filter(d => d);
      days.forEach(day => daysSet.add(day));
    });
    
    return Array.from(daysSet);
  };

  const availableDays = getAllUniqueDays();

  const getExercisesForDay = (day: string): Exercise[] => {
    if (!firstWorkout?.exercises) return [];
    
    for (const [key, exercises] of Object.entries(firstWorkout.exercises)) {
      const days = key.split(/[/,\s]+/).map(d => d.trim());
      if (days.includes(day) && Array.isArray(exercises)) {
        return exercises;
      }
    }
    return [];
  };

  const calculateCaloriesBurned = (exercises: Exercise[], weight: number = 70, durationHours: number = 1): number => {
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) return 0;

    const weightKg = weight > 100 ? weight / 2.2 : weight;

    const metValues: Record<string, number> = {
      'light': 3.0,
      'beginner': 3.5,
      'moderate': 5.0,
      'intermediate': 7.0,
      'intense': 9.0,
      'advanced': 10.5,
      'high': 12.0,
    };

    let totalCalories = 0;
    let exerciseCount = 0;

    exercises.forEach((ex) => {
      try {
        if (!ex.name || ex.name.trim() === '') return;
        
        exerciseCount++;
        
        const intensity = (ex.intensity || ex.difficulty || 'moderate').toLowerCase();
        const baseMET = metValues[intensity] || 5.0;
        
        let exerciseCalories = weightKg * baseMET * (durationHours / Math.max(exercises.length, 1));
        
        if (ex.sets && ex.sets > 0 && ex.reps) {
          const repsNum = typeof ex.reps === 'string' 
            ? parseInt(ex.reps.split('-')[0]) || 10
            : ex.reps || 10;
          const totalReps = ex.sets * repsNum;
          const volumeMultiplier = 1 + (totalReps / 100) * 0.5;
          exerciseCalories *= Math.min(volumeMultiplier, 2.5);
        }
        
        if (ex.weight && ex.weight > 0) {
          const weightMultiplier = 1 + (ex.weight / weightKg) * 0.2;
          exerciseCalories *= Math.min(weightMultiplier, 2.0);
        }
        
        totalCalories += exerciseCalories;
      } catch (err) {
        const baseMET = 5.0;
        totalCalories += weightKg * baseMET * (durationHours / Math.max(exercises.length, 1));
      }
    });

    if (exerciseCount === 0) return 0;

    const restingCalories = weightKg * 1.0 * durationHours;
    const totalBurned = Math.round(totalCalories + restingCalories);
    
    return Math.max(totalBurned, 100);
  };

  const getAllExercises = (): Exercise[] => {
    if (!firstWorkout?.exercises) return [];
    const all: Exercise[] = [];
    Object.values(firstWorkout.exercises).forEach((dayExercises) => {
      if (Array.isArray(dayExercises)) {
        all.push(...dayExercises);
      }
    });
    return all;
  };

  const allExercises = getAllExercises();
  const dietPlan = dietPlans && dietPlans.length > 0 ? dietPlans[0] : null;
  const dietCalories = dietPlan?.targetCalories || 0;
  
  const clientWeight = clientData?.weight && clientData.weight > 0 ? clientData.weight : 70;
  const caloriesBurned = firstWorkout && allExercises.length > 0 ? calculateCaloriesBurned(allExercises, clientWeight, 1) : 0;
  const calorieBalance = dietCalories - caloriesBurned;
  const isWeightGain = clientData?.goal?.toLowerCase().includes('weight_gain') || clientData?.goal?.toLowerCase().includes('bulk');

  if (isLoadingWorkouts) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your workout plan...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Workouts</h2>
          <p className="text-muted-foreground">{error instanceof Error ? error.message : "Failed to load your workout plan"}</p>
          <Button onClick={() => window.location.reload()} className="mt-4" data-testid="button-retry-workout">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!firstWorkout || availableDays.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <ClientHeader />
        <div className="flex flex-col items-center justify-center h-screen gap-4">
          <Dumbbell className="h-12 w-12 text-primary" />
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">No Workout Plan Assigned</h2>
            <p className="text-muted-foreground">Contact your trainer to get a personalized workout plan</p>
            <Button onClick={() => setContactTrainerOpen(true)} className="mt-4" data-testid="button-contact-trainer">
              Contact Trainer
            </Button>
          </div>
        </div>
        <ContactTrainerDialog open={contactTrainerOpen} onOpenChange={setContactTrainerOpen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">{firstWorkout.name}</h1>
              {firstWorkout.description && (
                <p className="text-sm text-muted-foreground">{firstWorkout.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Vertical Cards - Responsive */}
        <div className="space-y-6">
          {DAYS_OF_WEEK.map((day, dayIdx) => {
            const dayExercises = getExercisesForDay(day);
            const dayCalories = dayExercises.length > 0 ? calculateCaloriesBurned(dayExercises, clientWeight, 1) : 0;
            const hasExercises = dayExercises.length > 0;

            return (
              <Card key={day} className="overflow-hidden border-2 border-primary/10 hover:border-primary/20 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    {/* Day Summary Sidebar */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-b md:border-b-0 md:border-r-2 border-primary/20 px-6 py-4 flex md:flex-col justify-between md:justify-between md:min-w-[200px]">
                      <div>
                        <Badge variant="secondary" className="font-semibold mb-4 text-base px-3 py-1">
                          {day}
                        </Badge>
                      </div>
                      {hasExercises ? (
                        <>
                          <div className="space-y-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {dayCalories}
                              </span>
                              <span className="text-sm text-muted-foreground">cal</span>
                            </div>
                            <div className="space-y-1 text-xs md:text-sm hidden md:block">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Exercises:</span>
                                <span className="font-semibold text-primary">{dayExercises.length}</span>
                              </div>
                              {firstWorkout.difficulty && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Difficulty:</span>
                                  <Badge variant="outline" className="text-xs capitalize">{firstWorkout.difficulty}</Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground text-sm">Rest Day</div>
                      )}
                    </div>

                    {/* Exercises List */}
                    {hasExercises ? (
                      <div className="flex-1 p-4 md:p-6">
                        <div className="space-y-3">
                          {dayExercises.map((exercise, idx) => (
                            <div
                              key={idx}
                              className="border border-primary/10 rounded-md p-3 hover:bg-primary/5 transition-colors cursor-pointer"
                              onClick={() => setSelectedExercise(exercise)}
                              data-testid={`card-exercise-${idx}`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground text-sm md:text-base">{exercise.name}</p>
                                  {exercise.difficulty && (
                                    <Badge variant="outline" className="text-xs capitalize mt-1">
                                      {exercise.difficulty}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {/* Exercise Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                {exercise.sets && (
                                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded px-2 py-1 text-center">
                                    <p className="text-xs text-muted-foreground">Sets</p>
                                    <p className="font-bold text-blue-600 dark:text-blue-400 text-xs md:text-sm">{exercise.sets}</p>
                                  </div>
                                )}
                                {exercise.reps && (
                                  <div className="bg-orange-50 dark:bg-orange-950/30 rounded px-2 py-1 text-center">
                                    <p className="text-xs text-muted-foreground">Reps</p>
                                    <p className="font-bold text-orange-600 dark:text-orange-400 text-xs md:text-sm">{exercise.reps}</p>
                                  </div>
                                )}
                                {exercise.weight && (
                                  <div className="bg-primary/10 rounded px-2 py-1 text-center">
                                    <p className="text-xs text-muted-foreground">Weight</p>
                                    <p className="font-bold text-primary text-xs md:text-sm">{exercise.weight}kg</p>
                                  </div>
                                )}
                                {exercise.restTime && (
                                  <div className="bg-purple-50 dark:bg-purple-950/30 rounded px-2 py-1 text-center">
                                    <p className="text-xs text-muted-foreground">Rest</p>
                                    <p className="font-bold text-purple-600 dark:text-purple-400 text-xs md:text-sm">{exercise.restTime}s</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-6 text-center text-muted-foreground">
                        No exercises scheduled for this day
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Calorie Balance */}
        {dietCalories > 0 && (
          <Card className="mt-8 border-2 border-primary/10">
            <CardContent className="p-6 space-y-6">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Daily Calorie Balance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-900">
                  <p className="text-sm text-muted-foreground mb-2">Calories Consumed</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{dietCalories}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">From diet plan</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4 border border-orange-200 dark:border-orange-900">
                  <p className="text-sm text-muted-foreground mb-2">Calories Burned</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{caloriesBurned}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">From workout</p>
                </div>
                <div className={`${isWeightGain ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-primary/10'} rounded-lg p-4 border ${isWeightGain ? 'border-blue-200 dark:border-blue-800' : 'border-primary/20'}`}>
                  <p className="text-sm text-muted-foreground mb-2">Calorie {isWeightGain ? 'Surplus' : 'Deficit'}</p>
                  <div className="flex items-center gap-2">
                    {isWeightGain ? (
                      <TrendingUp className={`h-5 w-5 ${calorieBalance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} />
                    ) : (
                      <TrendingDown className={`h-5 w-5 ${calorieBalance <= 0 ? 'text-primary' : 'text-yellow-600 dark:text-yellow-400'}`} />
                    )}
                    <p className={`text-3xl font-bold ${calorieBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {Math.abs(calorieBalance)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {calorieBalance >= 0 ? '+' : ''}{calorieBalance} calories
                  </span>
                </div>
                <Progress value={Math.min(Math.max((dietCalories / (dietCalories + 500)) * 100, 0), 100)} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Exercise Details Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={(open) => { if (!open) setSelectedExercise(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              {selectedExercise?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedExercise && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {selectedExercise.sets && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Sets</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedExercise.sets}</p>
                  </div>
                )}
                {selectedExercise.reps && (
                  <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Reps</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{selectedExercise.reps}</p>
                  </div>
                )}
                {selectedExercise.weight && (
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-2xl font-bold text-primary">{selectedExercise.weight}kg</p>
                  </div>
                )}
                {selectedExercise.restTime && (
                  <div className="bg-purple-100/30 dark:bg-purple-950/30 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Rest</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedExercise.restTime}s</p>
                  </div>
                )}
              </div>
              {selectedExercise.notes && (
                <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                  <p className="text-sm"><strong>Notes:</strong> {selectedExercise.notes}</p>
                </div>
              )}
              {selectedExercise.difficulty && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm"><strong>Difficulty:</strong> <Badge className="capitalize ml-2">{selectedExercise.difficulty}</Badge></p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ContactTrainerDialog open={contactTrainerOpen} onOpenChange={setContactTrainerOpen} />
      <MobileNavigation />
    </div>
  );
}
