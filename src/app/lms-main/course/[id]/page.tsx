"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiGet, apiPatch } from '@/lib/http';
import { useRef } from 'react';
import CourseSidebar from '../components/CourseSidebar';
import LessonList from '../components/LessonList';
import VideoPlayer from '../components/VideoPlayer';

export default function CourseDetailPage() {
  const { id } = useParams();
  const courseId = Number(id);
  const [course, setCourse] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<number, any>>({});
  const [coursePct, setCoursePct] = useState(0);
  const [currentVideo, setCurrentVideo] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerTopRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const resp = await apiGet(`/api/app/courses/${courseId}`);
        if (cancelled) return;
        setCourse(resp.course);
        setVideos(resp.videos || []);
        setProgress(resp.progress || {});
        setCurrentVideo((resp.videos || [])[0] || null);
        const p = await apiGet(`/api/app/courses/${courseId}/progress`);
        if (cancelled) return;
        setCoursePct(p?.completion_ratio || 0);
      } catch (e: any) {
        setError(e?.message || 'Failed to load course');
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);

  const onHeartbeat = async (videoId: number, sec: number, isCompleted?: boolean) => {
    setProgress((prev) => ({ ...prev, [videoId]: { ...(prev[videoId]||{}), last_position_seconds: sec, is_completed: isCompleted || prev[videoId]?.is_completed }}));
    try {
      await apiPatch(`/api/app/videos/${videoId}/progress`, { lastPositionSeconds: sec, isCompleted });
    } catch {}
  };

  const initialPosition = currentVideo ? (progress[currentVideo.id]?.last_position_seconds || Number(localStorage.getItem(`sw_resume_${currentVideo.id}`) || 0)) : 0;
  const durationSec = videos.reduce((s, v) => s + (Number(v.duration_seconds || 0)), 0);
  const durationText = durationSec ? fmtDuration(durationSec) : undefined;

  return (
      <div className="px-0 py-0 w-full">
        {error && (
          <div className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
        )}
        {/* Player on top when playing */}
        <div ref={playerTopRef}></div>
        {isPlaying && currentVideo && (
          <div className="mb-6 sticky top-16 z-20">
            <VideoPlayer
              key={currentVideo.id}
              src={currentVideo.video_url}
              video={currentVideo}
              initialPosition={initialPosition}
              onHeartbeat={onHeartbeat}
              userWatermark={course?.title}
              variant="large"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <LessonList
              videos={videos}
              progress={progress}
              currentVideoId={currentVideo?.id}
              onSelect={(v: any) => {
                setCurrentVideo(v);
                setIsPlaying(true);
                setTimeout(() => playerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <CourseSidebar
              course={course}
              videosCount={videos.length}
              coursePct={coursePct}
              durationText={durationText}
              onStartPlay={() => {
                if (!currentVideo && videos[0]) setCurrentVideo(videos[0]);
                setIsPlaying(true);
                setTimeout(() => playerTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
              }}
            />
          </div>
        </div>
      </div>
  );
}

function fmtDuration(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const parts = [] as string[];
  if (h) parts.push(`${h} hr`);
  if (m || !h) parts.push(`${m} min`);
  return parts.join(' ');
}
