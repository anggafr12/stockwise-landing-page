"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  listCourses,
  listVideos,
  createVideo,
  deleteVideo,
  uploadVideoSource,
  type CourseRow,
  type VideoRow,
} from "@/app/admin/api/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function normalizeList<T>(resp: unknown): T[] {
  if (Array.isArray(resp)) return resp as T[];
  if (resp && typeof resp === "object") {
    const obj = resp as { rows?: unknown; data?: unknown };
    const list = obj.rows ?? obj.data ?? [];
    return Array.isArray(list) ? (list as T[]) : [];
  }
  return [];
}

function formatDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "-";
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export default function VideosAdmin() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);
  const [uploadingVideoId, setUploadingVideoId] = useState<number | null>(null);

  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});

  const loadCourses = async () => {
    setCoursesLoading(true);
    setCoursesError(null);
    try {
      const res = await listCourses({ page: 1, limit: 100, published: true });
      const list = normalizeList<CourseRow>(res);
      setCourses(list);
      if (list.length > 0) {
        setSelectedCourse((prev) => prev ?? list[0].id);
      } else {
        setSelectedCourse(null);
      }
    } catch (e: any) {
      const message = e?.message || "Gagal memuat courses";
      setCourses([]);
      setCoursesError(message);
      toast.error(message);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadVideos = async (courseId: number | null) => {
    if (!courseId) {
      setVideos([]);
      return;
    }
    setVideosLoading(true);
    setVideosError(null);
    try {
      const rows = await listVideos(courseId);
      setVideos(normalizeList<VideoRow>(rows));
    } catch (e: any) {
      const message = e?.message || "Gagal memuat video";
      setVideos([]);
      setVideosError(message);
      toast.error(message);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadVideos(selectedCourse);
  }, [selectedCourse]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) {
      toast.error("Pilih course terlebih dahulu");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title") || "").trim(),
      order_index: Number(fd.get("order_index") || 1),
    };

    if (!payload.title) {
      toast.error("Title wajib diisi");
      return;
    }

    try {
      await createVideo(selectedCourse, payload);
      toast.success("Video dibuat");
      (e.target as HTMLFormElement).reset();
      await loadVideos(selectedCourse);
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat video");
    }
  };

  const handleUpload = async (videoId: number, file: File | null) => {
    if (!selectedCourse || !file) return;
    setUploadingVideoId(videoId);
    try {
      const response = await uploadVideoSource(videoId, file);
      const payload = (response as { data?: any })?.data ?? response;
      const durationInfo = payload?.duration_seconds
        ? ` (${formatDuration(payload.duration_seconds)})`
        : "";
      toast.success(`Video diunggah${durationInfo}`);
      await loadVideos(selectedCourse);
    } catch (e: any) {
      toast.error(e?.message || "Gagal mengunggah video");
    } finally {
      setUploadingVideoId(null);
      const input = fileInputs.current[videoId];
      if (input) {
        input.value = "";
      }
    }
  };

  const remove = async (id: number) => {
    if (!selectedCourse) return;
    if (!confirm("Hapus video ini?")) return;
    try {
      await deleteVideo(id);
      toast.success("Video dihapus");
      await loadVideos(selectedCourse);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menghapus video");
    } finally {
      const input = fileInputs.current[id];
      if (input) input.value = "";
    }
  };

  const courseList = Array.isArray(courses) ? courses : [];
  const videoList = Array.isArray(videos) ? videos : [];

  return (
    <div className="space-y-8">
      {/* Picker Course */}
      <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Manage Videos</h3>
        {coursesError && (
          <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {coursesError}
          </div>
        )}
        {coursesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-10 rounded-lg bg-[#1E263A] animate-pulse" />
            ))}
          </div>
        ) : courseList.length === 0 ? (
          <div className="py-8 text-center text-gray-400 border border-dashed border-[#1E263A] rounded-lg">
            Belum ada course untuk dikelola.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="course">Course</Label>
              <select
                id="course"
                className="w-full rounded-md bg-[#2A3144] border-none h-10 px-3"
                value={selectedCourse ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCourse(value ? Number(value) : null);
                }}
              >
                {(courseList ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Form Create */}
      <form
        onSubmit={handleCreate}
        className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4">Create Video</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" className="bg-[#2A3144] border-none" required />
          </div>
          <div>
            <Label htmlFor="order_index">Order</Label>
            <Input
              id="order_index"
              name="order_index"
              type="number"
              defaultValue={1}
              className="bg-[#2A3144] border-none"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Setelah video dibuat, unggah file melalui tombol Upload di tabel di bawah.
        </p>
        <div className="pt-4">
          <Button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB]" disabled={!selectedCourse}>
            Save
          </Button>
        </div>
      </form>

      {/* List Videos */}
      <div className="bg-[#0F1629] border border-[#1E263A] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Videos</h3>
        </div>

        {videosError && (
          <div className="mb-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {videosError}
          </div>
        )}

        {videosLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-12 rounded-lg bg-[#1E263A] animate-pulse" />
            ))}
          </div>
        ) : !videosError && videoList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 border border-dashed border-[#1E263A] rounded-lg">
            Tidak ada video untuk course ini.
          </div>
        ) : (
          !videosError && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-200">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-[#1E263A]">
                    <th className="py-3 pr-4 w-16">Order</th>
                    <th className="py-3 pr-4">Title</th>
                    <th className="py-3 pr-4 w-28">Duration</th>
                    <th className="py-3 pr-4">Preview</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(videoList ?? []).map((v) => (
                    <tr key={v.id} className="border-b border-[#0A1324]">
                      <td className="py-3 pr-4">{v.order_index}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col gap-1">
                          <span>{v.title}</span>
                          {v.storage_path && (
                            <span className="text-xs text-gray-500 break-all">{v.storage_path}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 pr-4">{formatDuration(v.duration_seconds)}</td>
                      <td className="py-3 pr-4">
                        {v.video_url ? (
                          <div className="flex flex-col gap-2">
                            <video
                              controls
                              className="w-48 max-w-full rounded border border-[#1E263A] bg-black"
                              src={v.video_url}
                            />
                            <a
                              href={v.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 underline text-xs"
                            >
                              Buka di tab baru
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Belum ada file</span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex justify-end gap-2">
                          <input
                            ref={(el) => {
                              if (el) {
                                fileInputs.current[v.id] = el;
                              } else {
                                delete fileInputs.current[v.id];
                              }
                            }}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(event) => handleUpload(v.id, event.target.files?.[0] ?? null)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#1E263A] text-white"
                            disabled={uploadingVideoId === v.id}
                            onClick={() => fileInputs.current[v.id]?.click()}
                          >
                            {uploadingVideoId === v.id ? "Uploading..." : "Upload"}
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => remove(v.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
