import { ArrowRight } from "lucide-react";
import { Card } from "@/app/lms-main/components/ui/card";

interface CategoryCardProps {
  name: string;
  description: string;
  iconColor: string;
  level: string;
  onClick: () => void;
}

export const CategoryCard = ({ name, description, iconColor, level, onClick }: CategoryCardProps) => {
  const getBgColor = () => {
    if (level === 'BEGINNER') return 'bg-primary/20';
    if (level === 'INTERMEDIATE') return 'bg-cyan/20';
    return 'bg-accent/20';
  };

  const getIconBg = () => {
    if (level === 'BEGINNER') return 'bg-primary';
    if (level === 'INTERMEDIATE') return 'bg-cyan';
    return 'bg-accent';
  };

  const getIcon = () => {
    if (level === 'BEGINNER') return '🌱';
    if (level === 'INTERMEDIATE') return '🌿';
    return '💎';
  };

  return (
    <Card 
      className={`${getBgColor()} border-none p-6 cursor-pointer transition-all hover:scale-105 group`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`${getIconBg()} w-16 h-16 rounded-xl flex items-center justify-center text-3xl`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </Card>
  );
};
