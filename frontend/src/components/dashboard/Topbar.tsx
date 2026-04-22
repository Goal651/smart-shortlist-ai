"use client";

import { useRouter } from "next/navigation";
import { Search, Bell, Briefcase, LogOut, Menu } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { useAuth } from "@/contexts/AuthContext";

interface TopbarProps {
  onOpenNotif: () => void;
  onOpenProfile: () => void;
  onToggleSidebar: () => void;
}

export function Topbar({ onOpenNotif, onOpenProfile, onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HR";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-500 border border-gray-100"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative group">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="w-full h-10 bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4 lg:ml-6 lg:border-l lg:border-gray-100 lg:pl-4">
        {/* User info */}
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name || "HR Manager"}</p>
          <p className="text-xs text-gray-500 leading-tight">{user?.company || user?.email || "Admin"}</p>
        </div>

        <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
          <button
            onClick={onOpenNotif}
            className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 relative border border-gray-100"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
          </button>

          <button
            onClick={onOpenProfile}
            className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-semibold ring-2 ring-white hover:ring-primary/20 transition-all"
          >
            {initials}
          </button>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors border border-gray-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
