import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
}

export const SummaryCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  variant = "default",
}: SummaryCardProps) => {
  const variantStyles = {
    default: "from-card to-card/80",
    success: "from-success-light to-success-light/80",
    warning: "from-warning-light to-warning-light/80",
    destructive: "from-destructive/10 to-destructive/5",
  };

  const iconStyles = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${variantStyles[variant]} border-0 shadow-md hover:shadow-lg transition-smooth`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold mb-2">{value}</p>
            {trend && (
              <p
                className={`text-xs font-medium ${
                  trendUp ? "text-success" : "text-destructive"
                }`}
              >
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
