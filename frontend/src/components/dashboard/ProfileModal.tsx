"use client";

import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  Briefcase, 
  Mail, 
  Camera, 
  Lock, 
  Globe, 
  LogOut,
  ChevronRight,
  Settings
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Account">
      <div className="space-y-8 pb-4 animate-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col items-center justify-center space-y-4 pt-2">
           <div className="relative group cursor-pointer">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-medium border-2 border-white transition-all group-hover:scale-105 active:scale-95 shadow-sm">
                 HR
              </div>
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors shadow-sm">
                 <Camera className="h-3 w-3" />
              </div>
           </div>
           <div className="text-center space-y-1">
              <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">HR Manager</Typography>
              <Typography variant="caption" className="text-[10px] text-gray-600 font-medium tracking-wider leading-none">Administrator</Typography>
           </div>
           <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[10px] font-medium tracking-widest leading-none">Verified</span>
           </div>
        </div>

        <div className="space-y-3">
           {[
              { label: "Full Name", value: "Umurava Recruitment Team", icon: User },
              { label: "Email Address", value: "hr@umurava.africa", icon: Mail },
              { label: "Department", value: "Talent Strategy", icon: Briefcase }
           ].map((item, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-gray-50/10 border border-gray-100 rounded-2xl group hover:bg-white hover:border-primary/10 transition-all transition-none shadow-none">
                <div className="flex items-center space-x-3">
                   <div className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-primary transition-all">
                      <item.icon className="h-4.5 w-4.5" />
                   </div>
                   <div className="space-y-0.5">
                      <Typography variant="caption" className="text-[10px] text-gray-600 font-medium tracking-widest leading-none">{item.label}</Typography>
                      <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">{item.value}</Typography>
                   </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-primary transition-all" />
             </div>
           ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pb-2">
           <button onClick={onClose} className="flex items-center justify-center space-x-2 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-none group shadow-none">
              <Settings className="h-4 w-4 text-gray-600 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-medium tracking-widest">Settings</span>
           </button>
           <button className="flex items-center justify-center space-x-2 p-3 border border-gray-100 rounded-xl hover:bg-red-50 text-red-500 transition-none group shadow-none">
              <LogOut className="h-4 w-4" />
              <span className="text-[10px] font-medium tracking-widest">Sign Out</span>
           </button>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
           <Typography variant="caption" className="text-[9px] text-gray-300 font-medium leading-tight">Umurava AI v1.0.4 - Premium Recruiter Platform</Typography>
        </div>
      </div>
    </Modal>
  );
}
