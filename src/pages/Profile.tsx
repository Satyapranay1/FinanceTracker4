"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Shield, LogOut, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const backendUrl = "https://backend2-6dmv.onrender.com";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch user");
      setFullName(data.name);
      setEmail(data.email);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const handleProfileUpdate = async () => {
    if (!token) return toast.error("You are not logged in!");
    setLoadingProfile(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: fullName, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!token) return toast.error("You are not logged in!");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match!");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");

    setLoadingPassword(true);
    try {
      const res = await fetch(`${backendUrl}/api/auth/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password");
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
    toast.success("Logged out successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      <main className="flex-1 mt-[64px] p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Personal Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
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

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold">Security</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your account security</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">

            {/* Current Password */}
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400"
              />
              <span
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600 dark:text-gray-300"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* New Password */}
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400"
              />
              <span
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600 dark:text-gray-300"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md w-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-400"
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600 dark:text-gray-300"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <button
              onClick={handlePasswordUpdate}
              disabled={loadingPassword}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>

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
