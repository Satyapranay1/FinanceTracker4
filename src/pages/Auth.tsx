import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const backendURL = "https://backend2-6dmv.onrender.com/api/auth";

  // ---------------- VALIDATION ----------------
  const isValidGmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);

  const isValidPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/.test(
      password
    );

  // ---------------- GENERIC FETCH ----------------
  const makeRequest = async (endpoint, body) => {
    try {
      const res = await fetch(`${backendURL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type");
      const data = contentType?.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      return { res, data };
    } catch (err) {
      return { res: null, data: { message: "Network error" } };
    }
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!isValidGmail(loginData.email)) {
      toast.error("Please enter a valid Gmail address");
      return;
    }
    if (!isValidPassword(loginData.password)) {
      toast.error("Password must include a letter, number & special character");
      return;
    }

    setIsLoading(true);
    try {
      const { res, data } = await makeRequest("/login", loginData);

      if (res && res.ok) {
        if (data.token) localStorage.setItem("token", data.token);
        toast.success(data.message || "Login successful");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- SIGNUP ----------------
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupData.name) {
      toast.error("Please enter your name");
      return;
    }
    if (!isValidGmail(signupData.email)) {
      toast.error("Please enter a valid Gmail address");
      return;
    }
    if (!isValidPassword(signupData.password)) {
      toast.error("Password must include a letter, number & special character");
      return;
    }

    setIsLoading(true);
    try {
      const { res, data } = await makeRequest("/register", signupData);

      if (res && res.ok) {
        toast.success(data.message || "Account created successfully!");
        setIsLogin(true);
      } else {
        toast.error(data.message || "Signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          Finance Tracker
        </h1>

        <form
          onSubmit={isLogin ? handleLogin : handleSignup}
          className="space-y-5"
        >
          {!isLogin && (
            <div>
              <Label className="font-semibold">Full Name</Label>
              <Input
                type="text"
                value={signupData.name}
                onChange={(e) =>
                  setSignupData({ ...signupData, name: e.target.value })
                }
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label className="font-semibold">Email</Label>
            <Input
              type="email"
              value={isLogin ? loginData.email : signupData.email}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, email: e.target.value })
                  : setSignupData({ ...signupData, email: e.target.value })
              }
              placeholder="you@gmail.com"
              className="mt-1"
            />
          </div>

          {/* PASSWORD WITH NORMAL VIEW / HIDE OPTION */}
          <div className="relative">
            <Label className="font-semibold">Password</Label>

            <Input
              type={showPassword ? "text" : "password"}
              value={isLogin ? loginData.password : signupData.password}
              onChange={(e) =>
                isLogin
                  ? setLoginData({ ...loginData, password: e.target.value })
                  : setSignupData({ ...signupData, password: e.target.value })
              }
              placeholder="••••••••"
              className="mt-1 pr-10"
            />

            {/* Eye Toggle Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading
              ? isLogin
                ? "Logging in..."
                : "Creating account..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            className="text-blue-500 font-semibold cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
