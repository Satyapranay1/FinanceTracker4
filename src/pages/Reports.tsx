"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface Transaction {
  id: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
  transactionType?: string;
}

export default function Reports() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ category: string; amount: number }[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [quickRange, setQuickRange] = useState("firstHalf");
  const reportRef = useRef<HTMLDivElement>(null);

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28", "#FF8042", "#E74C3C"];
  const backendUrl = "https://backend2-6dmv.onrender.com"; // Direct URL

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch(`${backendUrl}/api/transactions/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch transactions");

        const txs: Transaction[] = await res.json();

        const categoryMap: Record<string, string> = {
          food: "Food & Dining",
          transport: "Transport",
          entertainment: "Entertainment",
          bills: "Bills",
          income: "Income",
        };

        const mappedTxs = txs.map((t) => ({
          ...t,
          type: t.transactionType?.toLowerCase() === "income" ? "income" : "expense",
          category: categoryMap[t.category.toLowerCase()] || t.category,
        }));

        setTransactions(mappedTxs as Transaction[]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date).toISOString().split("T")[0];
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });
    setFilteredTransactions(filtered);

    const catMap: Record<string, number> = {};
    filtered.forEach((t) => {
      if (t.type === "expense") catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const chartDataArr = Object.entries(catMap).map(([category, amount]) => ({ category, amount }));
    setChartData(chartDataArr);
  }, [dateRange, transactions]);

  const totalExpense = chartData.reduce((acc, item) => acc + item.amount, 0) || 1;

  const getMonthlyData = () => {
    const startMonth = new Date(dateRange.start).getMonth();
    const endMonth = new Date(dateRange.end).getMonth();
    const months = Array.from({ length: endMonth - startMonth + 1 }, (_, i) => i + startMonth);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((i) => {
      const monthTx = filteredTransactions.filter((t) => new Date(t.date).getMonth() === i);
      const income = monthTx.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      return { month: monthNames[i], income, expense };
    });
  };

  const handleQuickRange = (range: string) => {
    const year = new Date().getFullYear();
    if (range === "firstHalf") setDateRange({ start: `${year}-01-01`, end: `${year}-06-30` });
    else if (range === "secondHalf") setDateRange({ start: `${year}-07-01`, end: `${year}-12-31` });
    setQuickRange(range);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="flex-1 mt-[64px] overflow-auto p-6 md:p-8 space-y-6" ref={reportRef}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Financial Reports</h1>
            <p className="text-gray-500 dark:text-gray-400">Real-time analysis of your financial data</p>
          </div>
          <div className="flex gap-2">
            <Select onValueChange={handleQuickRange} value={quickRange}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Select Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="firstHalf">Jan - Jun</SelectItem>
                <SelectItem value="secondHalf">Jul - Dec</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="border px-2 py-1 rounded-md bg-background dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <span>-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="border px-2 py-1 rounded-md bg-background dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {chartData.length === 0 ? (
                  <p className="text-center mt-20 text-gray-500 dark:text-gray-400">No Expense</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="amount"
                        nameKey="category"
                        outerRadius={100}
                        label={({ name, value }) => `${name} (${Math.round((value / totalExpense) * 100)}%)`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {filteredTransactions.length === 0 ? (
                  <p className="text-center mt-20 text-gray-500 dark:text-gray-400">No Data</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="month" stroke="#8884d8" />
                      <YAxis stroke="#8884d8" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#FF4C4C" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Category Breakdown */}
        <Card className="shadow-md bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>Monthly Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400">No Expense</p>
            ) : (
              chartData.map((category, index) => {
                const percent = Math.round((category.amount / totalExpense) * 100);
                return (
                  <div key={category.category} className="my-2">
                    <div className="flex justify-between text-sm">
                      <span>{category.category}</span>
                      <span>₹{category.amount.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${percent}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                          height: "100%",
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
