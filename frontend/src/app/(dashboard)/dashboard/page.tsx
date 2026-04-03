"use client";

import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  XCircle, 
  TrendingUp,
  Plus,
  Upload,
  Search
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentJobsTable } from "@/components/dashboard/RecentJobsTable";
import { RecentCandidatesTable } from "@/components/dashboard/RecentCandidatesTable";
import { JobCard } from "@/components/dashboard/JobCard";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { useState } from "react";

const stats = [
  { label: "Total Jobs", value: "6", icon: Briefcase, iconBgColor: "bg-blue-50", iconColor: "text-blue-500" },
  { label: "Total Candidates", value: "8", icon: Users, iconBgColor: "bg-purple-50", iconColor: "text-purple-500" },
  { label: "Shortlisted", value: "4", icon: CheckCircle2, iconBgColor: "bg-green-50", iconColor: "text-green-500" },
  { label: "Rejected", value: "1", icon: XCircle, iconBgColor: "bg-red-50", iconColor: "text-red-500" },
  { label: "Avg Score", value: "76", icon: TrendingUp, iconBgColor: "bg-orange-50", iconColor: "text-orange-500" },
];

const jobOptions = [
  { label: "Frontend Engineer", value: "sfe" },
  { label: "Backend Developer", value: "bd" },
  { label: "UI/UX Designer", value: "uud" },
  { label: "DevOps Engineer", value: "de" },
];

const statusOptions = [
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Rejected", value: "rejected" },
];

export default function DashboardPage() {
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [candidatePage, setCandidatePage] = useState(1);

  return (
    <div className="space-y-10 bg- animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Typography variant="h1" className="text-xl font-semibold tracking-tight text-gray-900">Dashboard</Typography>
          <Typography variant="caption" className="text-gray-600 font-medium">Overview of your recruitment activity</Typography>
        </div>
        <div className="flex items-center space-x-3">
           <Button variant="outline" className="h-11 shadow-none border-gray-100 hover:border-primary/20">
             <Upload className="h-4 w-4 mr-2" />
             Upload
           </Button>
           <Button className="h-11 shadow-none gap-2 font-semibold px-6">
             <Plus className="h-5 w-5" />
             Create Job
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Recent Jobs Header with Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <Typography variant="h2" className="text-xl font-semibold text-gray-900">Recent Jobs</Typography>
         
         <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Search jobs..." 
                  className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans"
                />
            </div>
            <div className="w-full sm:w-56">
                <Select 
                  options={jobOptions} 
                  value={selectedJob} 
                  onChange={setSelectedJob} 
                  placeholder="Filter by Job" 
                />
            </div>
         </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-10">
        {/* Recent Jobs */}
        <div className="space-y-4">
           <RecentJobsTable />
           <Pagination 
             currentPage={currentPage} 
             totalPages={3} 
             onPageChange={setCurrentPage} 
           />
        </div>

        {/* Recent Candidates Header with Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6">
           <Typography variant="h2" className="text-xl font-semibold text-gray-900">Recent Candidates</Typography>
           
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans"
                  />
              </div>
              <div className="w-full sm:w-56">
                  <Select 
                    options={statusOptions} 
                    value={selectedStatus} 
                    onChange={setSelectedStatus} 
                    placeholder="Filter by Status" 
                  />
              </div>
           </div>
        </div>

        {/* Recent Candidates */}
        <div className="space-y-4">
          <RecentCandidatesTable />
           <Pagination 
             currentPage={candidatePage} 
             totalPages={2} 
             onPageChange={setCandidatePage} 
           />
        </div>
      </div>
    </div>
  );
}
