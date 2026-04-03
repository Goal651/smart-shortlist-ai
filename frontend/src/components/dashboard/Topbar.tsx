"use client";

import { Search, Bell, User } from "lucide-react";
import { Typography } from "@/components/ui/Typography";

export function Topbar() {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search jobs, candidates..."
            className="w-full h-11 bg-gray-50 border border-gray-100/50 rounded-xl pl-11 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all font-work-sans"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right hidden md:block">
          <Typography variant="body" className="text-sm font-semibold text-gray-900">
            Umurava Corp
          </Typography>
          <Typography variant="small" className="text-xs text-gray-600">
            Enterprise Client
          </Typography>
        </div>

        <div className="flex items-center space-x-3 border-l border-gray-100 pl-6">
          <button className="p-2.5 rounded-full hover:bg-gray-50 text-gray-600 relative transition-colors group">
            <Bell className="h-5 w-5 group-hover:text-primary" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <button className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white ring-2 ring-white hover:ring-primary shadow-sm transition-all group">
            <Typography variant="h3" className="text-sm tracking-widest group-hover:scale-110 transition-transform">HR</Typography>
          </button>
        </div>
      </div>
    </header>
  );
}
