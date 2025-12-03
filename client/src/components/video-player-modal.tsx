import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  videoId: string;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

function getVimeoVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
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

  const youtubeId = isYouTubeUrl(videoUrl) ? getYouTubeVideoId(videoUrl) : null;
  const vimeoId = isVimeoUrl(videoUrl) ? getVimeoVideoId(videoUrl) : null;
  const isEmbeddedVideo = !!youtubeId || !!vimeoId;

  // Load saved progress when modal opens (only for non-embedded videos)
  useEffect(() => {
    if (!isOpen || !videoId || isEmbeddedVideo) return;

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
  }, [isOpen, videoId, isEmbeddedVideo]);

  // Save progress periodically (only for non-embedded videos)
  useEffect(() => {
    if (!isOpen || !videoRef.current || !videoId || isEmbeddedVideo) return;

    const video = videoRef.current;

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

    const handlePlay = async () => {
      console.log('Video started playing, saving initial progress');
      await saveProgress();
    };

    saveIntervalRef.current = setInterval(saveProgress, 3000);

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
  }, [isOpen, videoId, isEmbeddedVideo]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden" data-testid="dialog-video-player">
        <DialogHeader className="flex flex-row items-center justify-between p-4 border-b bg-background">
          <DialogTitle className="text-lg font-semibold">{videoTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="w-full bg-black flex items-center justify-center relative">
          {youtubeId ? (
            <iframe
              className="w-full aspect-video max-h-[calc(90vh-80px)]"
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
              title={videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              data-testid="youtube-embed"
            />
          ) : vimeoId ? (
            <iframe
              className="w-full aspect-video max-h-[calc(90vh-80px)]"
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
              title={videoTitle}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              data-testid="vimeo-embed"
            />
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
