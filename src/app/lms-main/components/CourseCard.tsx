import { Play, Lock } from "lucide-react";
import { Card } from "@/app/lms-main/components/ui/card";
import { Button } from "@/app/lms-main/components/ui/button";

interface CourseCardProps {
  title: string;
  description: string;
  thumbnailUrl?: string;
  videoCount: number;
  durationMinutes: number;
  level: string;
  isLocked?: boolean;
  onClick: () => void;
}

export const CourseCard = ({
  title,
  description,
  thumbnailUrl,
  videoCount,
  durationMinutes,
  level,
  isLocked,
  onClick
}: CourseCardProps) => {
  const getLevelColor = () => {
    if (level === 'BEGINNER') return 'text-primary';
    if (level === 'INTERMEDIATE') return 'text-cyan';
    return 'text-accent';
  };

  const formatDuration = () => {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-card border-border overflow-hidden group cursor-pointer hover:border-primary transition-all">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">📚</span>
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
            <Lock className="w-12 h-12 text-white mb-2" />
            <span className="text-white text-sm font-medium">Member Access</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`${getLevelColor()} text-xs font-bold uppercase px-2 py-1 bg-background/90 rounded`}>
            {level}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {videoCount} Videos • {formatDuration()}
          </span>
          {!isLocked && (
            <Button 
              size="icon" 
              className="bg-primary hover:bg-primary/80 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Play className="w-4 h-4" fill="white" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
