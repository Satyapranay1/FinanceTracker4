"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RecommendationCard } from "@/components/RecommendationCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface AIInsights {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  dailyAverageExpense: number;
  dailyAverageIncome: number;
  categoryExpenses: Record<string, number>;
  categoryPercentIncome: Record<string, number>;
  categoryRecommendations: Record<string, string>;
  alerts: string[];
  topExpense: string;
  topIncome: string;
  monthlyTrends: Record<string, string>;
  overallRecommendation: string;
  suggestedSavings: number;
}

interface Recommendation {
  category: string;
  suggestion: string;
  hint?: string;
  impact: "High" | "Medium" | "Low";
  potentialSavings: number;
  percentOfIncome?: number;
  applied?: boolean;
}

export default function Recommendations() {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [estimatedSavings, setEstimatedSavings] = useState(0);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecs, setSelectedRecs] = useState<Recommendation[]>([]);
  const token = localStorage.getItem("token");
  const backendUrl = "https://backend2-6dmv.onrender.com";

  const impactColors = {
    High: "bg-red-500",
    Medium: "bg-yellow-400",
    Low: "bg-green-400",
  };

  // Load saved selected recommendations & savings
  useEffect(() => {
    const savedRecs = localStorage.getItem("selectedRecs");
    const savedSavings = localStorage.getItem("estimatedSavings");
    if (savedRecs) setSelectedRecs(JSON.parse(savedRecs));
    if (savedSavings) setEstimatedSavings(Number(savedSavings));
  }, []);

  // Persist selected recommendations & savings
  useEffect(() => {
    localStorage.setItem("selectedRecs", JSON.stringify(selectedRecs));
    localStorage.setItem("estimatedSavings", estimatedSavings.toString());
  }, [selectedRecs, estimatedSavings]);

  // Fetch AI insights from backend
  useEffect(() => {
    if (!token) return;

    const fetchInsights = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/insights/ai`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch AI insights");
        const data: AIInsights = await res.json();
        setInsights(data);

        const recs: Recommendation[] = Object.keys(data.categoryRecommendations).map((cat) => {
          const spent = data.categoryExpenses[cat];
          const percent = (spent / data.totalIncome) * 100;
          let hintText = "";

          if (percent > 20) hintText = `⚠️ Immediately reduce spending on ${cat}`;
          else if (percent > 10) hintText = `🔹 Try reducing ${cat} expenses for better savings`;
          else hintText = `✅ Optional: Optimize ${cat} if possible`;

          return {
            category: cat,
            suggestion: data.categoryRecommendations[cat],
            hint: hintText,
            impact: percent > 15 ? "High" : percent > 5 ? "Medium" : "Low",
            potentialSavings: spent,
            percentOfIncome: Math.min(100, percent),
            applied: selectedRecs.some((r) => r.category === cat),
          };
        });

        setRecommendations(recs.filter((r) => !r.applied));
      } catch (err) {
        console.error(err);
      }
    };

    fetchInsights();
  }, [token, refreshCount, selectedRecs]);

  const handleApplyRecommendation = (rec: Recommendation) => {
    setSelectedRecs((prev) => [...prev, rec]);
    setEstimatedSavings((prev) => prev + rec.potentialSavings);
    setRecommendations((prev) => prev.filter((r) => r.category !== rec.category));
  };

  const handleIgnoreRecommendation = (rec: Recommendation) => {
    setRecommendations((prev) => prev.filter((r) => r.category !== rec.category));
  };

  const handleApplyAll = () => {
    setSelectedRecs((prev) => [...prev, ...recommendations]);
    const total = recommendations.reduce((acc, r) => acc + r.potentialSavings, 0);
    setEstimatedSavings((prev) => prev + total);
    setRecommendations([]);
  };

  const handleDeleteSelected = (rec: Recommendation) => {
    setSelectedRecs((prev) => prev.filter((r) => r.category !== rec.category));
    setEstimatedSavings((prev) => prev - rec.potentialSavings);
    setRecommendations((prev) => [...prev, { ...rec, applied: false }]);
  };

  if (!insights) return <div className="flex items-center justify-center h-screen">Loading AI insights...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50"><Navbar /></div>

      <main className="flex-1 mt-[64px] overflow-auto p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Recommendations</h1>
            <p className="text-gray-500 dark:text-gray-400">Personalized insights to optimize your spending</p>
            <p className="mt-1 text-lg font-semibold">Estimated Savings Applied: ₹{estimatedSavings.toLocaleString()}</p>
            <p className="mt-1 text-lg font-semibold">Total Potential Savings Available: ₹{recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setRefreshCount((prev) => prev + 1)}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Insights
            </Button>
            <Button onClick={handleApplyAll}>Apply All Recommendations</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Total Income</CardTitle></CardHeader>
            <CardContent>${insights.totalIncome.toLocaleString()}</CardContent>
          </Card>
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Total Expense</CardTitle></CardHeader>
            <CardContent>${insights.totalExpense.toLocaleString()}</CardContent>
          </Card>
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
            <CardContent className={insights.balance < 0 ? "text-red-500" : "text-green-500"}>₹{insights.balance.toLocaleString()}</CardContent>
          </Card>
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Top Expense</CardTitle></CardHeader>
            <CardContent>{insights.topExpense}</CardContent>
          </Card>
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Top Income</CardTitle></CardHeader>
            <CardContent>{insights.topIncome}</CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {insights.alerts.length > 0 && (
          <div className="space-y-2">
            {insights.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-100 dark:bg-red-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
                <p className="text-sm text-red-800 dark:text-red-200">{alert}</p>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.category}
              category={rec.category}
              suggestion={rec.suggestion}
              hint={rec.hint} // Pass hint to card
              impact={rec.impact}
              potentialSavings={rec.potentialSavings}
              percentOfIncome={rec.percentOfIncome}
              applied={rec.applied}
              onApply={() => handleApplyRecommendation(rec)}
              onIgnore={() => handleIgnoreRecommendation(rec)}
            />
          ))}
        </div>

        {/* Selected Recommendations */}
        {selectedRecs.length > 0 && (
          <Card className="shadow-md p-4 bg-white dark:bg-gray-800">
            <CardHeader><CardTitle>Selected Recommendations</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selectedRecs.map((rec) => (
                <div key={rec.category} className="flex justify-between items-center p-2 border-b last:border-b-0 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div>
                    <span className="font-semibold">{rec.category}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{rec.suggestion}</p>
                    {rec.hint && <p className="text-xs text-gray-500 dark:text-gray-400">{rec.hint}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-white rounded ${impactColors[rec.impact]}`}>₹{rec.potentialSavings.toLocaleString()}</span>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteSelected(rec)}>Delete</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
