"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

export default function LogoutButton() {
  const handleLogout = async () => {
    localStorage.removeItem("currentUser");
    await logoutAction();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-error/80 hover:text-error transition-colors px-3 py-1.5 rounded-lg hover:bg-error/10"
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  );
}
