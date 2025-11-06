"use client";

import { useEffect, useRef, useState } from 'react';
import VideoGuard from '@/components/lms/VideoGuard';

type Props = {
  src: string;
  video: any;
  initialPosition: number;
  onHeartbeat: (videoId: number, sec: number, done?: boolean) => void;
  userWatermark?: string;
  variant?: 'compact' | 'large';
};

export default function VideoPlayer({ src, video, initialPosition, onHeartbeat, userWatermark, variant = 'large' }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onLoaded = () => {
      if (initialPosition && !Number.isNaN(initialPosition)) {
        try { el.currentTime = initialPosition; } catch {}
      }
    };
    el.addEventListener('loadedmetadata', onLoaded);

    const onPause = () => {
      const sec = Math.floor(ref.current?.currentTime || 0);
      localStorage.setItem(`sw_resume_${video.id}`, String(sec));
      onHeartbeat(video.id, sec, false);
    };
    const onEnded = () => {
      onHeartbeat(video.id, Math.floor(ref.current?.duration || 0), true);
      localStorage.removeItem(`sw_resume_${video.id}`);
    };
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);

    const iv = setInterval(() => {
      if (!ref.current) return;
      const sec = Math.floor(ref.current.currentTime || 0);
      localStorage.setItem(`sw_resume_${video.id}`, String(sec));
      onHeartbeat(video.id, sec, false);
    }, 5000);

    const onUnload = () => onPause();
    window.addEventListener('beforeunload', onUnload);

    // deterrents
    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockKeys = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k.includes('printscreen') || (e.ctrlKey && (k === 'p' || k === 's'))) {
        e.preventDefault();
        const el = document.getElementById('sw-anticap');
        if (el) { el.style.opacity = '1'; setTimeout(() => (el.style.opacity = '0'), 1200); }
      }
    };
    document.addEventListener('contextmenu', blockContext);
    window.addEventListener('keydown', blockKeys);
    document.addEventListener('visibilitychange', () => { if (document.hidden && ref.current) ref.current.pause(); });

    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('contextmenu', blockContext);
      window.removeEventListener('keydown', blockKeys);
      clearInterval(iv);
    };
  }, [video?.id]);

  const videoClass = variant === 'large'
    ? 'w-full bg-black object-contain h-[260px] sm:h-[360px] md:h-[480px] lg:h-[620px]'
    : 'w-full bg-black object-contain h-[200px] sm:h-[260px] md:h-[320px] lg:h-[420px]';

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#1E263A] bg-[#0F1629]">
      <VideoGuard watermark={userWatermark || 'STOCKWISE'} />
      <video
        ref={ref}
        src={src}
        className={videoClass}
        controls
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
