"use client";

import { useState } from "react";
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  Bell, 
  Globe, 
  Lock, 
  Mail, 
  CheckCircle2, 
  ChevronRight,
  Database,
  Cpu,
  Eye,
  LogOut,
  Moon,
  Sun,
  Layout,
  Briefcase,
  Key,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  MessageSquare,

} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const categories = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "recruitment", label: "AI Screening Rules", icon: Sparkles },
  { id: "account", label: "Account & Login", icon: Lock },
  { id: "alerts", label: "Email Notifications", icon: Bell },
  { id: "integrations", label: "Connected Apps", icon: Database },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("profile");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-1">
        <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Settings</Typography>
        <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Configure your recruitment preferences and account details</Typography>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Pane */}
        <div className="lg:col-span-3 space-y-2">
            <Card className="p-2 border-gray-100 shadow-none bg-white">
               {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                      activeCategory === cat.id 
                        ? "bg-primary text-white shadow-none" 
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <cat.icon className={cn("h-4 w-4", activeCategory === cat.id ? "text-white" : "text-gray-600 group-hover:text-gray-900")} />
                      <span className="text-xs font-medium">{cat.label}</span>
                    </div>
                    <ChevronRight className={cn("h-3 w-3 opacity-50", activeCategory === cat.id ? "block" : "hidden group-hover:block")} />
                  </button>
               ))}
               <div className="mt-4 pt-4 border-t border-gray-50 px-2 pb-2">
                  <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-none group">
                     <LogOut className="h-4 w-4" />
                     <span className="text-[10px] font-medium tracking-widest leading-none">Sign Out</span>
                  </button>
               </div>
            </Card>
        </div>

        {/* Main Content Pane */}
        <div className="lg:col-span-9 space-y-8 animate-in slide-in-from-right-4 duration-500">
           {/* Section 1: My Profile */}
           {activeCategory === "profile" && (
             <Card className="p-8 space-y-8 border-gray-100 shadow-none bg-white">
                <div className="space-y-1">
                   <Typography variant="h2" className="text-xl font-medium text-gray-900">My Profile</Typography>
                   <Typography variant="caption" className="text-gray-600 font-medium">Update your professional information for the Umurava platform</Typography>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                   <div className="space-y-2">
                      <label className="text-[10px] font-medium text-gray-600 tracking-widest ml-1 leading-none">Full name</label>
                      <input 
                        defaultValue="Umurava HR Team" 
                        className="w-full h-11 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-medium text-gray-600 tracking-widest ml-1 leading-none">Work email</label>
                      <input 
                        defaultValue="hr@umurava.africa" 
                        className="w-full h-11 bg-gray-50/50 border border-gray-100 rounded-xl px-4 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-none" 
                      />
                   </div>
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-medium text-gray-600 tracking-widest ml-1 leading-none">Bio / Company summary</label>
                      <textarea 
                        className="w-full min-h-[120px] bg-gray-50/50 border border-gray-100 rounded-xl p-4 text-xs font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none shadow-none" 
                        defaultValue="Recruiting top-tier African tech talent for global opportunities."
                      />
                   </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-end font-medium">
                   <Button className="h-10 px-8 shadow-none font-medium transition-none">Save changes</Button>
                </div>
             </Card>
           )}

           {/* Section 2: AI Screening Rules */}
           {activeCategory === "recruitment" && (
             <Card className="p-8 space-y-8 border-gray-100 shadow-none bg-white">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <Typography variant="h2" className="text-xl font-medium text-gray-900 flex items-center gap-2">
                         AI screening rules
                      </Typography>
                      <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Set the criteria for how AI ranks your candidates</Typography>
                   </div>
                </div>

                <div className="space-y-4 pt-2">
                   {[
                      { 
                        title: "Shortlist threshold", 
                        desc: "Minimum matching score for a candidate to be automatically shortlisted.",
                        value: "80%",
                        type: "toggle" 
                      },
                      { 
                        title: "Strict filter mode", 
                        desc: "Only show candidates who match every mandatory skill in the job description.",
                        value: true,
                        type: "switch" 
                      },
                      { 
                        title: "Language settings", 
                        desc: "Set the primary language Gemini uses for technical analysis.",
                        value: "English",
                        type: "select" 
                      }
                   ].map((rule, i) => (
                      <div key={i} className="flex items-start justify-between p-5 bg-gray-50/20 rounded-2xl border border-gray-100 transition-all shadow-none">
                         <div className="space-y-1 max-w-sm px-2">
                            <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">{rule.title}</Typography>
                            <Typography variant="caption" className="text-[11px] text-gray-700 font-medium leading-relaxed block">{rule.desc}</Typography>
                         </div>
                         <div className="flex items-center space-x-3 pr-2">
                            {rule.type === 'switch' ? (
                               <button className={cn(
                                  "h-6 w-11 rounded-full p-1 transition-all shadow-none",
                                  rule.value ? "bg-primary" : "bg-gray-200"
                               )}>
                                  <div className={cn(
                                     "h-4 w-4 bg-white rounded-full transition-all",
                                     rule.value ? "translate-x-5" : "translate-x-0"
                                  )} />
                               </button>
                            ) : (
                               <span className="px-3 py-1 bg-white border border-gray-100 text-[10px] font-medium text-primary rounded-lg tracking-widest leading-none">{rule.value}</span>
                            )}
                         </div>
                      </div>
                   ))}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-end">
                   <Button className="h-10 px-8 shadow-none font-medium transition-none">Update rules</Button>
                </div>
             </Card>
           )}

           {/* Section 3: Account & Login [NEW] */}
           {activeCategory === "account" && (
              <Card className="p-8 space-y-8 border-gray-100 shadow-none bg-white">
                 <div className="space-y-1">
                    <Typography variant="h2" className="text-xl font-medium text-gray-900">Account & security</Typography>
                    <Typography variant="caption" className="text-gray-600 font-medium">Manage your security credentials and platform access</Typography>
                 </div>

                 <div className="space-y-6 pt-2">
                    <div className="p-5 bg-gray-50/20 rounded-2xl border border-gray-100 space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                             <Key className="h-5 w-5 text-gray-700" />
                             <div>
                                <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">Password</Typography>
                                <Typography variant="caption" className="text-xs text-gray-700 font-medium pt-1 block">Your last password change was 3 months ago.</Typography>
                             </div>
                          </div>
                          <Button variant="outline" className="h-9 px-4 text-xs font-medium border-gray-200">Update password</Button>
                       </div>
                    </div>

                    <div className="p-5 bg-gray-50/20 rounded-2xl border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                           <Smartphone className="h-5 w-5 text-gray-700" />
                           <div>
                              <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">Two-factor authentication</Typography>
                              <Typography variant="caption" className="text-xs text-gray-700 font-medium pt-1 block">Add an extra layer of security to your HR account.</Typography>
                           </div>
                        </div>
                        <button className="h-6 w-11 rounded-full p-1 bg-gray-200 transition-all shadow-none">
                           <div className="h-4 w-4 bg-white rounded-full transition-all translate-x-0" />
                        </button>
                    </div>
                 </div>
              </Card>
           )}

           {/* Section 4: Email Notifications [NEW] */}
           {activeCategory === "alerts" && (
              <Card className="p-8 space-y-8 border-gray-100 shadow-none bg-white">
                 <div className="space-y-1">
                    <Typography variant="h2" className="text-xl font-medium text-gray-900">Email notifications</Typography>
                    <Typography variant="caption" className="text-gray-600 font-medium">Choose when and how often you get recruitment alerts</Typography>
                 </div>

                 <div className="space-y-4 pt-2">
                    {[
                      { title: "New candidate analysis", desc: "Get an email every time a new candidate is analyzed by the AI.", value: true },
                      { title: "Screening batch complete", desc: "Get a summary report when a bulk upload batch is fully ranked.", value: true },
                      { title: "Job board activity", desc: "Notifications about job post approvals or closing dates.", value: false },
                      { title: "Weekly talent digest", desc: "A summary of top talent matching your active job posts.", value: true }
                    ].map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-gray-50/20 rounded-2xl border border-gray-100 transition-all shadow-none">
                         <div className="space-y-1">
                            <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">{alert.title}</Typography>
                            <Typography variant="caption" className="text-xs text-gray-700 font-medium leading-relaxed block">{alert.desc}</Typography>
                         </div>
                         <button className={cn(
                            "h-6 w-11 rounded-full p-1 transition-all shadow-none shrink-0 ml-4",
                            alert.value ? "bg-primary" : "bg-gray-200"
                         )}>
                            <div className={cn(
                               "h-4 w-4 bg-white rounded-full transition-all",
                               alert.value ? "translate-x-5" : "translate-x-0"
                            )} />
                         </button>
                      </div>
                    ))}
                 </div>
              </Card>
           )}

           {/* Section 5: Connected Apps [NEW] */}
           {activeCategory === "integrations" && (
              <Card className="p-8 space-y-8 border-gray-100 shadow-none bg-white">
                 <div className="space-y-1">
                    <Typography variant="h2" className="text-xl font-medium text-gray-900">Connected apps</Typography>
                    <Typography variant="caption" className="text-gray-600 font-medium">Sync your talent data with external recruitment platforms</Typography>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {[
                      
                       { name: "Greenhouse ATS", icon: ExternalLink, status: "Not Connected", color: "green" },
                       { name: "Intercom Chat", icon: MessageSquare, status: "Not Connected", color: "orange" }
                    ].map((app, i) => (
                       <div key={i} className="p-5 bg-gray-50/20 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center space-y-4 group hover:border-gray-200 transition-all shadow-none">
                          <div className={cn(
                             "h-12 w-12 rounded-xl flex items-center justify-center border",
                             app.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                             app.color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-600" :
                             app.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                             "bg-orange-50 border-orange-100 text-orange-600"
                          )}>
                             <app.icon className="h-6 w-6" />
                          </div>
                          <div>
                             <Typography variant="body" className="text-sm font-medium text-gray-900 leading-none">{app.name}</Typography>
                             <Typography variant="caption" className={cn(
                                "text-[10px] font-medium  tracking-widest pt-2 block",
                                app.status === 'Connected' ? "text-green-600" : "text-gray-600"
                             )}>{app.status}</Typography>
                          </div>
                          <Button variant="outline" className="w-full h-9 text-xs font-medium border-gray-200">
                             {app.status === 'Connected' ? 'Manage' : 'Connect'}
                          </Button>
                       </div>
                    ))}
                 </div>
              </Card>
           )}
        </div>
      </div>
    </div>
  );
}
