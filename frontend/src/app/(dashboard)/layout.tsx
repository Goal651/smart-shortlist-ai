"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { NotificationModal } from "@/components/dashboard/NotificationModal";
import { ProfileModal } from "@/components/dashboard/ProfileModal";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Typography } from "@/components/ui/Typography";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <AppProvider>
      <ToastProvider>
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
      </ToastProvider>
    </AppProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

