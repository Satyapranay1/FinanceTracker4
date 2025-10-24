"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit, X } from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  transactionType: string;
  type?: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const backendURL = "https://backend2-6dmv.onrender.com/api/transactions";

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    amount: "",
    type: "expense",
  });

  const incomeCategories = [
    "Salary",
    "Investment",
    "Bonus",
    "Freelance",
    "Other",
  ];
  const expenseCategories = [
    "Food & Dining",
    "Transport",
    "Entertainment",
    "Bills",
    "Other",
  ];

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You are not logged in!");
      return null;
    }
    return token;
  };

  const fetchTransactions = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    toast.info("Fetching your transactions...");
    try {
      const res = await fetch(`${backendURL}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        toast.error(
          `Failed to fetch transactions: ${res.status} ${res.statusText}`
        );
        return;
      }

      const data = await res.json();
      const mapped = data.map((t: Transaction) => ({
        ...t,
        type: t.transactionType?.toLowerCase() || "expense",
      }));
      setTransactions(mapped);
      toast.success("Transactions loaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Network error while fetching transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async () => {
    const token = getToken();
    if (!token) return;

    const { date, category, description, amount, type } = formData;

    if (!date || !category || !description || !amount || !type) {
      return toast.error("⚠️ All fields are required!");
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return toast.error("❌ Amount must be a valid number!");
    }

    if (numericAmount <= 0) {
      return toast.error("❌ Amount must be greater than 0!");
    }

    const payload = {
      date: new Date(date).toISOString(),
      category: category.trim(),
      description: description.trim(),
      amount: numericAmount,
      transactionType: type.toUpperCase(),
    };

    try {
      toast.loading(
        editingTransaction
          ? "Updating transaction..."
          : "Adding new transaction..."
      );

      const url = editingTransaction
        ? `${backendURL}/update/${editingTransaction.id}`
        : `${backendURL}/add`;
      const method = editingTransaction ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok)
        throw new Error(
          `Failed to save transaction: ${res.status} ${res.statusText}`
        );

      toast.success(
        editingTransaction
          ? "✅ Transaction updated successfully!"
          : "✅ Transaction added successfully!"
      );

      setShowModal(false);
      setEditingTransaction(null);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        category: "",
        description: "",
        amount: "",
        type: "expense",
      });

      await fetchTransactions();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error saving transaction. Please try again.");
    } finally {
      toast.dismiss();
    }
  };

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;

    toast.info("Deleting transaction...");
    try {
      const res = await fetch(`${backendURL}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok)
        throw new Error(`Failed to delete transaction: ${res.statusText}`);

      toast.success("🗑️ Transaction deleted successfully!");
      await fetchTransactions();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error deleting transaction. Please try again.");
    }
  };

  const openEditForm = (transaction: Transaction) => {
    toast.info("Editing transaction...");
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date?.split("T")[0],
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type?.toLowerCase() || "expense",
    });
    setShowModal(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 mt-[64px] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transactions</h1>
          <Button
            onClick={() => {
              toast.info("Opening add transaction form...");
              setEditingTransaction(null);
              setFormData({
                date: new Date().toISOString().split("T")[0],
                category: "",
                description: "",
                amount: "",
                type: "expense",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="bg-card dark:bg-gray-900 border rounded-lg shadow-lg w-full max-w-md p-6 relative animate-scale-in">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                onClick={() => {
                  setShowModal(false);
                  toast.info("Transaction form closed.");
                }}
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-xl font-semibold mb-4">
                {editingTransaction ? "Edit Transaction" : "Add Transaction"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={(e) => {
                      toast.info(`Changed type to ${e.target.value}`);
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value,
                        category: "",
                      }));
                    }}
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => {
                      toast.info(`Selected category: ${val}`);
                      setFormData((prev) => ({ ...prev, category: val }));
                    }}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.type === "income"
                        ? incomeCategories
                        : expenseCategories
                      ).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isNaN(Number(value))) {
                        toast.error("❌ Please enter a valid number.");
                      }
                      setFormData((prev) => ({ ...prev, amount: value }));
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    toast.info("Transaction creation canceled.");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTransaction ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card dark:bg-gray-800 shadow-md animate-scale-in">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          transaction.type === "income"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }
                      >
                        {transaction.type.charAt(0).toUpperCase() +
                          transaction.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"}₹
                        {Number(transaction.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditForm(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
