"use client";

import { useState, useEffect } from "react";
import { loginAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Eye, EyeOff, User, UserPlus, LogIn } from "lucide-react";

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Initialize Admin777 in local storage if not exists
  useEffect(() => {
    const usersStr = localStorage.getItem("chainscan_users");
    let users = {};
    if (usersStr) {
      try {
        users = JSON.parse(usersStr);
      } catch (e) {}
    }
    
    // Hardcode the default Admin777 account if it's completely empty
    if (Object.keys(users).length === 0) {
      users = {
        "Admin777": "777"
      };
      localStorage.setItem("chainscan_users", JSON.stringify(users));
    }
  }, []);

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccessMsg("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");

    const usersStr = localStorage.getItem("chainscan_users") || "{}";
    let users: Record<string, string> = {};
    try {
      users = JSON.parse(usersStr);
    } catch (e) {}

    if (isRegistering) {
      // Registration Logic
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      
      if (username.length < 3) {
        setError("Username must be at least 3 characters");
        setIsLoading(false);
        return;
      }

      if (users[username]) {
        setError("Username already exists");
        setIsLoading(false);
        return;
      }

      // Save user
      users[username] = password;
      localStorage.setItem("chainscan_users", JSON.stringify(users));

      
      setSuccessMsg("Account created successfully! You can now log in.");
      setIsRegistering(false);
      setPassword("");
      setConfirmPassword("");
      setIsLoading(false);

    } else {
      // Login Logic
      if (users[username] === password) {
        // Track the current logged-in user
        localStorage.setItem("currentUser", username);

        // Authenticated client-side, now tell server to set cookie
        const result = await loginAction(true);
        if (result.success) {
          router.push("/");
        } else {
          setError(result.error || "Authentication failed on server");
          setIsLoading(false);
        }
      } else {
        setError("Invalid username or password");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-4 my-8">
      <div className="w-full max-w-md bg-card border border-card-border rounded-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-500 relative">
        
        {/* Developed by Tag */}
        <div className="absolute -top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Developed by 777 Group
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="flex items-center justify-center overflow-hidden rounded-xl bg-background border border-card-border shadow-[0_0_15px_rgba(6,182,212,0.4)] p-1">
            <Image 
              src="/Logo1.png" 
              alt="777 ChainScan Logo" 
              width={64} 
              height={64} 
              className="object-cover rounded-lg"
              priority
            />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {isRegistering ? "Create Account" : "Protected Access"}
          </h2>
          <p className="text-sm text-foreground/60">
            {isRegistering 
              ? "Register a new account and optionally set up your default wallet addresses."
              : "Please enter your credentials to access the 777 ChainScan dashboard."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50">
              <User size={20} />
            </div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-card-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30 text-center"
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30 text-center pr-12"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {isRegistering && (
            <div className="relative animate-in slide-in-from-top-2">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-card-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-foreground/30 text-center pr-12"
                required={isRegistering}
                disabled={isLoading}
              />
            </div>
          )}



          {error && <p className="text-error text-sm text-center animate-in fade-in">{error}</p>}
          {successMsg && <p className="text-success text-sm text-center animate-in fade-in">{successMsg}</p>}

          <button
            type="submit"
            disabled={isLoading || !password || !username || (isRegistering && !confirmPassword)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : isRegistering ? (
              <><UserPlus size={20} /> Register Account</>
            ) : (
              <><LogIn size={20} /> Login to Dashboard</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleToggleMode}
            disabled={isLoading}
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {isRegistering ? "Already have an account? Login here" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
