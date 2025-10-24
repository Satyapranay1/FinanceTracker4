"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Shield, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const backendUrl = "https://backend2-6dmv.onrender.com";

  // Profile fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Security fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Fetch current user info
  const fetchUser = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Fetch User Response:", data);

      if (!res.ok) throw new Error(data.message || "Failed to fetch user");

      setFullName(data.name);
      setEmail(data.email);
    } catch (error: any) {
      console.error("Fetch User Error:", error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  // Update profile (name/email)
  const handleProfileUpdate = async () => {
    if (!token) return toast.error("You are not logged in!");
    setLoadingProfile(true);

    try {
      console.log("Sending profile update:", { name: fullName, email });

      const res = await fetch(`${backendUrl}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: fullName, email }),
      });

      const data = await res.json();
      console.log("Profile Update Response:", data, "status:", res.status);

      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      toast.success(data.message || "Profile updated successfully!");

      // Optimistic update – already set in state
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      toast.error(error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async () => {
    if (!token) return toast.error("You are not logged in!");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoadingPassword(true);

    try {
      console.log("Sending password update:", { currentPassword, newPassword });

      const res = await fetch(`${backendUrl}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      console.log("Password Update Response:", data, "status:", res.status);

      if (!res.ok) throw new Error(data.message || "Failed to update password");

      toast.success(data.message || "Password updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password Update Error:", error);
      toast.error(error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/auth");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <main className="flex-1 mt-[64px] p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 animate-slide-up space-y-4">
          <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={handleProfileUpdate}
            disabled={loadingProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Security Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold">Security</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account security</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handlePasswordUpdate}
              disabled={loadingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>

          {/* Logout */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
