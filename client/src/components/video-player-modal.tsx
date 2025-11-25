import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  videoId: string;
}

export function VideoPlayerModal({ 
  isOpen, 
  onClose, 
  videoUrl, 
  videoTitle,
  videoId
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeRef = useRef<number>(0);

  // Load saved progress when modal opens
  useEffect(() => {
    if (!isOpen || !videoId) return;

    console.log('Loading progress for videoId:', videoId);
    
    const loadAndSetProgress = async () => {
      try {
        const res = await fetch(`/api/video-progress/${videoId}`, {
          credentials: 'include',
        });
        const data = await res.json();
        console.log('Fetched progress data:', data);
        if (data?.watchedDuration > 0) {
          savedTimeRef.current = data.watchedDuration;
          console.log('Saved time to ref:', data.watchedDuration);
          // Try to set it immediately if video is ready
          if (videoRef.current && videoRef.current.readyState >= 1) {
            videoRef.current.currentTime = data.watchedDuration;
            console.log('Immediately set video to', data.watchedDuration);
          }
        }
      } catch (error) {
        console.error('Failed to load video progress:', error);
      }
    };

    loadAndSetProgress();

    // Also handle canplay event to ensure we set time even if video is already loading
    const handleCanPlay = () => {
      if (savedTimeRef.current > 0 && videoRef.current) {
        videoRef.current.currentTime = savedTimeRef.current;
        console.log('canplay event: Set video to', savedTimeRef.current);
      }
    };

    const handleLoadedMetadata = () => {
      if (savedTimeRef.current > 0 && videoRef.current) {
        videoRef.current.currentTime = savedTimeRef.current;
        console.log('loadedmetadata event: Set video to', savedTimeRef.current);
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('canplay', handleCanPlay);
        videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [isOpen, videoId]);

  // Save progress periodically - save every 3 seconds regardless of pause state
  useEffect(() => {
    if (!isOpen || !videoRef.current || !videoId) return;

    const video = videoRef.current;

    // Save progress immediately on first timeupdate (when duration is available)
    const saveProgress = async () => {
      if (video.duration > 0) {
        try {
          console.log('Saving progress:', video.currentTime, '/', video.duration);
          const res = await fetch(`/api/video-progress/${videoId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              watchedDuration: video.currentTime,
              totalDuration: video.duration,
            }),
          });
          const data = await res.json();
          console.log('Progress saved successfully:', data);
        } catch (error) {
          console.error('Failed to save video progress:', error);
        }
      }
    };

    // Save on first play event
    const handlePlay = async () => {
      console.log('Video started playing, saving initial progress');
      await saveProgress();
    };

    // Save every 3 seconds (always, regardless of pause state)
    saveIntervalRef.current = setInterval(saveProgress, 3000);

    // Save on video end
    const handleEnded = async () => {
      console.log('Video ended, saving final progress:', video.currentTime, '/', video.duration);
      await saveProgress();
    };

    video.addEventListener('play', handlePlay, { once: true });
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [isOpen, videoId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden" data-testid="dialog-video-player">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-background">
          <DialogTitle className="text-lg font-semibold">{videoTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="w-full bg-black flex items-center justify-center relative">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-auto max-h-[calc(90vh-80px)] object-contain"
            data-testid="video-element"
            controlsList="nodownload"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
