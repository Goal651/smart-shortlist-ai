"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Upload, 
  Users, 
  Settings,
  ChevronLeft,
  LogOut,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col h-screen sticky top-0 transition-all">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative h-16 w-24 translate-x-1">
            <Image src="/umurava.png" alt="Logo" fill className="object-contain" />
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all transition-none group",
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "text-gray-600 hover:bg-gray-50 active:scale-95"
              )}
            >
              <item.icon className={cn("h-6 w-6", !isActive && "group-hover:text-gray-900 transition-colors")} />
              <span className="text-[13px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 mt-auto bg-gray-50/20">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 group transition-all">
          <div className="flex items-center space-x-3 min-w-0">
             <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white text-xs font-medium border border-primary/20">
               HR
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-900 truncate">HR Manager</p>
                <p className="text-[12px] text-gray-600 font-medium truncate leading-none pt-1">Corporate organization</p>
             </div>
          </div>
          <button className="text-gray-600 hover:text-red-500 transition-colors p-1.5 flex items-center justify-center">
             <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
