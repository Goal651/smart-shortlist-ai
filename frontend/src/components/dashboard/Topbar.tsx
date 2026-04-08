"use client";

import { useRouter } from "next/navigation";
import { Search, Bell, User, Briefcase } from "lucide-react";
import { Typography } from "@/components/ui/Typography";

interface TopbarProps {
  onOpenNotif: () => void;
  onOpenProfile: () => void;
}

export function Topbar({ onOpenNotif, onOpenProfile }: TopbarProps) {
  const router = useRouter();
  
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search for candidates, jobs or talent pools..."
            className="w-full h-11 bg-gray-50/50 border border-transparent rounded-xl pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-work-sans text-gray-900 shadow-none border-gray-100"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="text-right hidden md:block space-y-0.5">
          <Typography variant="body" className="text-sm font-medium text-gray-900 leading-tight">
            Umurava Corp
          </Typography>
          <Typography variant="small" className="text-[10px] text-gray-600 font-medium leading-tight">
            Enterprise Client
          </Typography>
        </div>

        <div className="flex items-center space-x-3 border-l border-gray-100 pl-6 h-10">
          <button 
            onClick={onOpenNotif}
            className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-600 relative transition-all group border border-gray-100/50 shadow-none transition-none"
          >
            <Bell className="h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white shadow-none" />
          </button>
          
          <button 
            onClick={() => router.push('/jobs')}
            className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-600 relative transition-all group border border-gray-100/50 shadow-none transition-none"
          >
            <Briefcase className="h-4 w-4 group-hover:text-primary transition-colors" />
          </button>
          
          <button 
            onClick={onOpenProfile}
            className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white ring-2 ring-white hover:ring-primary/20 shadow-none transition-all group overflow-hidden"
          >
            <span className="text-xs font-medium leading-none tracking-tight group-hover:scale-110 transition-transform">HR</span>
          </button>
        </div>
      </div>
    </header>
  );
}
