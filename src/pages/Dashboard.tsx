"use client";

import { useState, useEffect } from "react";
import { SummaryCard } from "@/components/SummaryCard";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";

interface Transaction {
  id: number;
  title?: string;
  description?: string;
  amount: number;
  date: string;
  category: string;
  transactionType: string; // ✅ backend field: "INCOME" | "EXPENSE"
}

interface SummaryData {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlySavings: number;
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    monthlySavings: 0,
  });

  const token = localStorage.getItem("token");
  const backendurl = "https://backend2-6dmv.onrender.com";

  useEffect(() => {
    if (!token) {
      toast.error("You are not logged in!");
      return;
    }

    const fetchData = async () => {
      toast.info("📊 Fetching your dashboard data...");
      try {
        const res = await fetch(`${backendurl}/api/transactions/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch transactions");
        }

        const data: Transaction[] = await res.json();
        setTransactions(data);
        toast.success("✅ Transactions loaded successfully!");

        // ✅ Filter income and expense properly based on transactionType
        const isIncome = (t: Transaction) =>
          t.transactionType?.toUpperCase() === "INCOME";
        const isExpense = (t: Transaction) =>
          t.transactionType?.toUpperCase() === "EXPENSE";

        const totalIncome = data
          .filter(isIncome)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const totalExpenses = data
          .filter(isExpense)
          .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

        const totalBalance = totalIncome - totalExpenses;
        const monthlySavings = totalIncome > 0 ? totalBalance * 0.2 : 0;

        setSummary({ totalBalance, totalIncome, totalExpenses, monthlySavings });
      } catch (error: any) {
        console.error(error);
        toast.error(`❌ ${error.message || "Error loading dashboard data"}`);
      }
    };

    fetchData();
  }, [token]);

  const recentTransactions = [...transactions]
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="min-h-screen w-full bg-background dark:bg-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 overflow-auto pt-20">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your financial overview
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            <SummaryCard
              title="Total Balance"
              value={`₹${summary.totalBalance.toFixed(2)}`}
              icon={Wallet}
              trendUp={summary.totalBalance >= 0}
              variant="default"
            />
            <SummaryCard
              title="Total Income"
              value={`₹${summary.totalIncome.toFixed(2)}`}
              icon={TrendingUp}
              trendUp={true}
              variant="success"
            />
            <SummaryCard
              title="Total Expenses"
              value={`₹${summary.totalExpenses.toFixed(2)}`}
              icon={TrendingDown}
              trendUp={false}
              variant="destructive"
            />
            <SummaryCard
              title="Monthly Savings"
              value={parseFloat(summary.monthlySavings.toFixed(2)) >= 0 ? `₹${summary.monthlySavings.toFixed(2)}` : '₹0'}
              icon={PiggyBank}
              trendUp={true}
              variant="success"
            />
          </div>

          {/* Recent Transactions */}
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Recent Transactions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => {
                  const isIncome = tx.transactionType?.toUpperCase() === "INCOME";
                  const Icon = isIncome ? TrendingUp : TrendingDown;

                  return (
                    <Card
                      key={tx.id}
                      className="shadow-md bg-white dark:bg-gray-800"
                    >
                      <CardHeader className="flex items-center gap-2">
                        <Icon
                          className={`h-5 w-5 ${
                            isIncome ? "text-green-500" : "text-red-500"
                          }`}
                        />
                        <CardTitle className="text-gray-900 dark:text-gray-100">
                          {tx.title || tx.description || "Transaction"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <div>
                          <p className="text-muted-foreground dark:text-gray-400">
                            {new Date(tx.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {tx.category}
                          </p>
                        </div>
                        <p
                          className={`font-bold ${
                            isIncome ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isIncome ? "+" : "-"}₹
                          {Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No transactions found.
                </p>
              )}

              {/* Total Card */}
              {recentTransactions.length > 0 && (
                <Card className="shadow-md bg-gray-100 dark:bg-gray-700 col-span-full">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-gray-100">
                      Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Income: ₹{summary.totalIncome.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Expenses: ₹{summary.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      Balance: ₹{summary.totalBalance.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
