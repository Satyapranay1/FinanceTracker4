import { Sparkles, TrendingDown, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface RecommendationCardProps {
  category: string;
  suggestion: string;
  hint?: string; // Added hint
  impact: 'Low' | 'Medium' | 'High';
  potentialSavings: number;
  percentOfIncome?: number;
  onApply?: () => void;
  onIgnore?: () => void;
  applied?: boolean;
}

export const RecommendationCard = ({
  category,
  suggestion,
  hint,
  impact,
  potentialSavings,
  percentOfIncome = 0,
  onApply,
  onIgnore,
  applied = false,
}: RecommendationCardProps) => {
  const impactColors = {
    Low: "bg-green-400",
    Medium: "bg-yellow-400",
    High: "bg-red-500",
  };

  return (
    <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-smooth animate-fade-in ${applied ? "opacity-60" : ""}`}>
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">{category}</h3>
              <Badge className={impactColors[impact]} variant="secondary">{impact} Impact</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{suggestion}</p>
            {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden mt-1">
              <div className={`${impactColors[impact]} h-2`} style={{ width: `${percentOfIncome}%` }}></div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-success">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">Save ₹{potentialSavings.toLocaleString()}</span>
              </div>
              {!applied && (
                <div className="flex gap-2">
                  {onIgnore && <Button variant="outline" size="sm" onClick={onIgnore}>Ignore</Button>}
                  {onApply && <Button size="sm" onClick={onApply}><Check className="h-4 w-4 mr-1" /> Apply</Button>}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
