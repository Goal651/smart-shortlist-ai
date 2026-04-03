"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Upload, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings,
  ChevronLeft,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Upload", href: "/upload", icon: Upload },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "AI Chat", href: "/ai-chat", icon: MessageSquare },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-100 bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative h-16 w-24">
            <Image src="/umurava.png" alt="Logo" fill className="object-contain" />
          </div>
         
        </div>
        <button className="p-1.5 hover:bg-gray-50 rounded-lg border border-gray-100 text-gray-600">
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-0.5 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-none",
                isActive 
                  ? "bg-primary text-white font-medium" 
                  : "text-gray-700"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-600")} />
              <span className="text-[13px] font-medium font-work-sans">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-50 mt-auto">
        <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
            HR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate font-dm-sans">HR Manager</p>
            <p className="text-xs text-gray-600 truncate font-work-sans">hr@umurava.africa</p>
          </div>
          <LogOut className="h-4 w-4 text-gray-600 transition-colors" />
        </div>
      </div>
    </aside>
  );
}
