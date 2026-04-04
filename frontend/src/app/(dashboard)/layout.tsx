"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { NotificationModal } from "@/components/dashboard/NotificationModal";
import { ProfileModal } from "@/components/dashboard/ProfileModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <Topbar 
          onOpenNotif={() => setIsNotifOpen(true)} 
          onOpenProfile={() => setIsProfileOpen(true)} 
        />
        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}
