import { Play } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";

interface CourseCardProps {
  thumbnail: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  videoCount: number;
  duration: string;
  onClick?: () => void;
}

const CourseCard = ({
  thumbnail,
  title,
  level,
  videoCount,
  duration,
  onClick,
}: CourseCardProps) => {
  const levelColors = {
    beginner: "bg-beginner text-beginner-foreground",
    intermediate: "bg-intermediate text-intermediate-foreground",
    advanced: "bg-advanced text-advanced-foreground",
  };

  return (
    <div
      className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
      style={{ backgroundColor: "#0B1D43" }}
      onClick={onClick}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
          <p className="text-sm mb-2">Investing for Beginners</p>
          <h3 className="text-3xl font-bold text-advanced">INVESTING 101</h3>
        </div>
      </div>

      <div className="p-4 text-white">
        <Badge className={cn("mb-3 uppercase text-xs", levelColors[level])}>
          {level}
        </Badge>

        <h4 className="font-medium mb-3 line-clamp-2">{title}</h4>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300">
            {videoCount} Videos - {duration}
          </span>

          <Button
            size="icon"
            className="rounded-full bg-primary hover:bg-primary/90"
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
