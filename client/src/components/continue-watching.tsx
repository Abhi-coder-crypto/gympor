import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Play, ArrowRight, Check, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Video {
  id: string;
  _id?: string;
  title: string;
  category: string;
  thumbnail?: string;
  duration?: number;
  caloriePerMinute?: number;
}

interface ContinueWatchingProps {
  videos: Video[];
  isLoading?: boolean;
  onWatchAll?: () => void;
  clientId?: string | null;
}

interface CompletionStatus {
  [videoId: string]: {
    completed: boolean;
    caloriesBurned: number;
    completedAt: Date;
  };
}

function VideoCard({ 
  video, 
  clientId,
  isCompleted,
  caloriesBurned,
  onComplete,
  isCompleting
}: { 
  video: Video; 
  clientId?: string | null;
  isCompleted: boolean;
  caloriesBurned: number;
  onComplete: () => void;
  isCompleting: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card
      key={video.id || video._id}
      className="overflow-hidden transition-all group border-0 h-full flex flex-col"
      data-testid={`video-card-${video.id || video._id}`}
    >
      <div className="relative bg-gradient-to-br from-slate-300 to-slate-400 overflow-hidden rounded-lg h-48 w-full cursor-pointer hover-elevate">
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
        {!imageLoaded && (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-300 to-slate-400 absolute inset-0">
            <Play className="h-8 w-8 text-white/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 hover:bg-blue-700 rounded-full p-3">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        </div>
        {video.duration && (
          <div className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-1 flex items-center gap-1">
            <Clock className="h-3 w-3 text-white" />
            <span className="text-xs font-semibold text-white">
              {video.duration} min
            </span>
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-2 left-2 bg-green-500 rounded-lg px-2 py-1 flex items-center gap-1">
            <Check className="h-3 w-3 text-white" />
            <span className="text-xs font-semibold text-white">Done</span>
          </div>
        )}
      </div>
      <CardContent className="pt-4 pb-2 space-y-2 flex-1 flex flex-col">
        <div className="text-xs font-medium text-muted-foreground capitalize">
          {video.category}
        </div>
        <p className="font-semibold text-base line-clamp-2">
          {video.title}
        </p>
        
        {clientId && (
          <div className="mt-auto pt-3">
            {isCompleted ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 no-default-hover-elevate no-default-active-elevate">
                  <Check className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
                {caloriesBurned > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 no-default-hover-elevate no-default-active-elevate">
                    <Flame className="h-3 w-3 mr-1" />
                    {caloriesBurned} cal
                  </Badge>
                )}
              </div>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
                disabled={isCompleting}
                data-testid={`button-complete-video-${video.id || video._id}`}
              >
                {isCompleting ? (
                  "Completing..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Mark Complete
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ContinueWatching({ videos, isLoading, onWatchAll, clientId }: ContinueWatchingProps) {
  const displayVideos = videos.slice(0, 9);
  const { toast } = useToast();
  const [completingVideoId, setCompletingVideoId] = useState<string | null>(null);

  const { data: completionStatus = {} } = useQuery<CompletionStatus>({
    queryKey: [`/api/clients/${clientId}/videos/completion-status`],
    enabled: !!clientId,
    staleTime: 0,
    refetchInterval: 10000,
  });

  const completeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const res = await apiRequest("POST", `/api/clients/${clientId}/videos/${videoId}/complete`);
      return res.json();
    },
    onSuccess: (data, videoId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${clientId}/videos/completion-status`] });
      queryClient.invalidateQueries({ queryKey: ['/api/clients', clientId, 'calories-burned'] });
      
      if (data.caloriesBurned > 0) {
        toast({
          title: "Workout Complete!",
          description: `You burned ${data.caloriesBurned} calories!`,
        });
      } else {
        toast({
          title: "Workout Complete!",
          description: "Great job finishing your workout!",
        });
      }
      setCompletingVideoId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark video as complete",
        variant: "destructive",
      });
      setCompletingVideoId(null);
    }
  });

  const handleComplete = (videoId: string) => {
    setCompletingVideoId(videoId);
    completeMutation.mutate(videoId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-black dark:text-white">Workout Library</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onWatchAll}
          data-testid="button-watch-all"
          className="flex items-center gap-1 text-black border-black hover:bg-black/5"
        >
          Watch all
          <ArrowRight className="h-3 w-3 text-black" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayVideos.map((video) => {
          const videoId = video.id || video._id || "";
          const status = completionStatus[videoId];
          return (
            <VideoCard 
              key={videoId} 
              video={video} 
              clientId={clientId}
              isCompleted={status?.completed || false}
              caloriesBurned={status?.caloriesBurned || 0}
              onComplete={() => handleComplete(videoId)}
              isCompleting={completingVideoId === videoId}
            />
          );
        })}
      </div>
    </div>
  );
}
