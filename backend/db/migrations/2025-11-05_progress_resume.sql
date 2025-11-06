-- Add last_position_seconds + unique per (user, video) + view for completion ratio

-- Tambah last_position_seconds agar bisa resume
ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS last_position_seconds integer DEFAULT 0;

-- Jaga agar 1 baris per user+video (unique index)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE tablename='progress' AND indexname='progress_unique_user_video'
  ) THEN
    CREATE UNIQUE INDEX progress_unique_user_video
      ON public.progress(user_id, video_id);
  END IF;
END $$;

-- View ringkas untuk persen course per user (opsional)
CREATE OR REPLACE VIEW public.v_course_progress AS
SELECT
  u.id AS user_id,
  c.id AS course_id,
  COALESCE(AVG(
    LEAST(
      CASE WHEN v.duration_seconds > 0
           THEN p.last_position_seconds::decimal / v.duration_seconds
           ELSE 0 END,
      1
    )
  ),0) AS completion_ratio
FROM users u
CROSS JOIN courses c
LEFT JOIN videos v ON v.course_id = c.id
LEFT JOIN progress p ON p.user_id = u.id AND p.video_id = v.id
GROUP BY u.id, c.id;

