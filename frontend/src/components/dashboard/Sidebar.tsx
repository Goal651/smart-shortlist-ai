"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Upload, Users, Settings, LogOut, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "HR";

  return (
    <aside className={cn(
      "w-64 border-r border-gray-100 bg-white flex flex-col h-screen transition-transform duration-300 ease-in-out z-50",
      "fixed top-0 left-0 lg:static lg:sticky lg:top-0 lg:z-auto",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className="p-6 flex items-center">
        <div className="relative h-16 w-24 translate-x-1">
          <Image src="/umurava.png" alt="Logo" fill className="object-contain" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors group",
                isActive
                  ? "bg-primary text-white font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", !isActive && "group-hover:text-gray-900")} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 mt-auto bg-gray-50/20">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "HR Manager"}</p>
              <p className="text-xs text-gray-500 truncate leading-none pt-0.5">{user?.company || user?.email || "Admin"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-gray-400 hover:text-red-500 transition-colors p-1.5 shrink-0"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
