"use client";

import { useState, useCallback } from "react";
import {
   Briefcase,
   Users,
   CheckCircle2,
   XCircle,
   TrendingUp,
   Plus,
   Upload,
   Sparkles
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { RecentJobsTable } from "@/components/dashboard/RecentJobsTable";
import { RecentCandidatesTable } from "@/components/dashboard/RecentCandidatesTable";
import { Pagination } from "@/components/ui/Pagination";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useJobs, useScreening } from '@/hooks/useApi';

export default function DashboardPage() {
   const [currentPage, setCurrentPage] = useState(1);
   const [candidatePage, setCandidatePage] = useState(1);
   const [jobsTotalPages, setJobsTotalPages] = useState(1);
   const [candidatesTotalPages, setCandidatesTotalPages] = useState(1);
   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

   const { jobs } = useJobs();
   const firstJobId = jobs.length > 0 ? jobs[0]._id : null;
   const { candidates } = useScreening(firstJobId || '');

   const handleJobsTotalPages = useCallback((total: number) => setJobsTotalPages(total), []);
   const handleCandidatesTotalPages = useCallback((total: number) => setCandidatesTotalPages(total), []);

   const realStats = [
      { label: "Total jobs", value: jobs.length.toString(), icon: Briefcase, color: "blue" },
      { label: "Total candidates", value: candidates.length.toString(), icon: Users, color: "purple" },
      { label: "AI matches", value: candidates.filter(c => c.score > 75).length.toString(), icon: CheckCircle2, color: "green" },
      { label: "Waitlisted", value: candidates.filter(c => c.status === 'Review').length.toString(), icon: XCircle, color: "red" },
      {
         label: "Average score",
         value: candidates.length > 0
            ? `${Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)}%`
            : "—",
         icon: TrendingUp,
         color: "orange"
      },
   ];

   return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
         {/* Header section with Actions */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Statistics summary</Typography>
               <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Overview of your global talent acquisition metrics</Typography>
            </div>
            <div className="flex items-center space-x-3">
               <Button variant="outline" className="h-11 shadow-none border-gray-100 font-medium px-6 text-gray-600 transition-none">
                  <Upload className="h-4 w-4 mr-2" />
                  Import batch
               </Button>
               <Button onClick={() => setIsCreateModalOpen(true)} className="h-11 shadow-none gap-2 font-medium px-6 transition-none">
                  <Plus className="h-5 w-5" />
                  Create new job
               </Button>
            </div>
         </div>

         {/* Synchronized Statistics Summary */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {realStats.map((stat, i) => (
               <Card key={i} className="p-5 flex items-center space-x-4 border-gray-100 shadow-none">
                  <div className={cn(
                     "h-11 w-11 rounded-xl flex items-center justify-center border transition-all",
                     stat.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                        stat.color === 'purple' ? "bg-purple-50 border-purple-100 text-purple-600" :
                           stat.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                              stat.color === 'red' ? "bg-red-50 border-red-100 text-red-600" :
                                 "bg-orange-50 border-orange-100 text-orange-600"
                  )}>
                     <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                     <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">{stat.value}</Typography>
                     <Typography variant="caption" className="text-[10px] text-gray-600 font-medium pt-0.5 block leading-none">{stat.label}</Typography>
                  </div>
               </Card>
            ))}
         </div>

         <div className="grid grid-cols-1 gap-12">
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-2">
                     <Briefcase className="h-5 w-5 text-gray-900" />
                     <Typography variant="h2" className="text-xl font-medium text-gray-900">Active job boards</Typography>
                  </div>
               </div>

               <div className="space-y-4">
                  <Card className="border-gray-50 overflow-hidden shadow-none">
                     <RecentJobsTable currentPage={currentPage} onTotalPagesChange={handleJobsTotalPages} />
                     <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50">
                        <Pagination
                           currentPage={currentPage}
                           totalPages={jobsTotalPages}
                           onPageChange={setCurrentPage}
                           className="shadow-none border-0"
                        />
                     </div>
                  </Card>
               </div>
            </div>

            {/* AI Insight banner */}
            <Card className="p-6 bg-primary/[0.03] border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-none">
               <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-primary border border-primary/10 group transition-all">
                     <Sparkles className="h-6 w-6 fill-primary/5 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                     <Typography variant="body" className="font-medium text-gray-900 leading-tight">AI talent insight</Typography>
                     <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                        "Your 'Senior frontend' pool has grown by 15% this week with an average match score of 82%."
                     </p>
                  </div>
               </div>
               <Button variant="outline" className="h-10 px-6 border-primary/20 text-primary hover:bg-primary/5 shadow-none font-medium text-xs transition-none">View full report</Button>
            </Card>

            {/* Recent analyzed candidates */}
            <div className="space-y-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-2">
                     <Users className="h-5 w-5 text-gray-900" />
                     <Typography variant="h2" className="text-xl font-medium text-gray-900">Recently analyzed candidates</Typography>
                  </div>
               </div>

               <div className="space-y-4">
                  <Card className="border-gray-50 overflow-hidden shadow-none">
                     <RecentCandidatesTable currentPage={candidatePage} onTotalPagesChange={handleCandidatesTotalPages} />
                     <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50">
                        <Pagination
                           currentPage={candidatePage}
                           totalPages={candidatesTotalPages}
                           onPageChange={setCandidatePage}
                           className="shadow-none border-0"
                        />
                     </div>
                  </Card>
               </div>
            </div>
         </div>

         <CreateJobModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
         />
      </div>
   );
}
