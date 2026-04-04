"use client";

import { 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  UserPlus, 
  Briefcase, 
  Clock, 
  X,
  FileSearch,
  Zap,
  ArrowRight
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const mockNotifications = [
  { id: "1", type: "screening", title: "Screening Complete", desc: "Batch upload processed. 50 candidates ranked.", time: "2 mins ago", icon: Sparkles, color: "blue" },
  { id: "2", type: "shortlist", title: "New Top Match", desc: "Alice Mukamana scored 92% for Senior Frontend role.", time: "15 mins ago", icon: Zap, color: "orange" },
  { id: "3", type: "upload", title: "Upload Success", desc: "New candidates from LinkedIn ingested.", time: "1 hour ago", icon: FileSearch, color: "green" },
  { id: "4", type: "job", title: "New Job Draft", desc: "Draft created for Junior UI Designer.", time: "3 hours ago", icon: Briefcase, color: "purple" },
];

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications">
      <div className="space-y-6 pb-2">
        <div className="flex items-center justify-between">
           <Typography variant="caption" className="text-[10px] font-medium text-gray-600 tracking-widest">Recent Activity</Typography>
           <button className="text-[10px] font-medium text-primary hover:underline tracking-widest transition-none shadow-none">Clear All</button>
        </div>

        <div className="space-y-1">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className="group p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-all cursor-pointer shadow-none">
               <div className="flex items-start space-x-4">
                  <div className={cn(
                     "h-9 w-9 rounded-xl flex items-center justify-center border transition-colors",
                     notif.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                     notif.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-600" :
                     notif.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                     "bg-purple-50 border-purple-100 text-purple-600"
                  )}>
                     <notif.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                     <div className="flex items-center justify-between">
                        <Typography variant="body" className="text-sm font-medium text-gray-900 leading-tight truncate">{notif.title}</Typography>
                        <Typography variant="caption" className="text-[9px] text-gray-600 font-medium whitespace-nowrap">{notif.time}</Typography>
                     </div>
                     <Typography variant="caption" className="text-xs text-gray-600 font-medium leading-relaxed truncate block">{notif.desc}</Typography>
                  </div>
               </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-50 flex items-center justify-center">
           <button onClick={onClose} className="text-[10px] font-medium text-gray-600 hover:text-gray-900 tracking-widest transition-none shadow-none flex items-center gap-1.5">
             Close Notifications
             <ArrowRight className="h-3 w-3" />
           </button>
        </div>
      </div>
    </Modal>
  );
}
