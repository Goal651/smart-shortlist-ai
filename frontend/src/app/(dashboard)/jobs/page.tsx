"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { JobCard } from "@/components/dashboard/JobCard";
import { Pagination } from "@/components/ui/Pagination";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { useJobs } from '@/hooks/useApi';

const jobTypeOptions = [
  { label: "All Types", value: "all" },
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
];

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Closed", value: "closed" },
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("all");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { jobs, loading, error } = useJobs();

  // Filter jobs based on search and filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Since Job interface doesn't have type/status fields, we'll only filter by search for now
    return matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Typography variant="h1" className="text-xl font-medium tracking-tight text-gray-900">Jobs</Typography>
          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Manage and create job opportunities</Typography>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 shadow-none gap-2 font-medium px-6 transition-none"
        >
          <Plus className="h-5 w-5" />
          Create Job
        </Button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by job title or keywords..." 
            className="w-full h-12 bg-white border border-gray-100 rounded-xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all font-work-sans text-gray-900 placeholder:text-gray-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="w-full sm:w-48">
            <Select 
              options={jobTypeOptions} 
              value={jobType} 
              onChange={setJobType} 
              placeholder="Job Type" 
            />
          </div>
          <div className="w-full sm:w-48">
            <Select 
              options={statusOptions} 
              value={status} 
              onChange={setStatus} 
              placeholder="Status" 
            />
          </div>
        </div>
      </div>

      {/* Jobs Card List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Typography variant="body" className="text-red-600">Error loading jobs: {error}</Typography>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Typography variant="body" className="text-gray-600">No jobs found</Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job._id} {...job} />
          ))}
        </div>
      )}

      {/* Pagination Section */}
      <div className="pt-6">
        <Pagination 
          currentPage={currentPage} 
          totalPages={5} 
          onPageChange={setCurrentPage} 
          className="border border-gray-100 rounded-2xl shadow-none"
        />
      </div>

      <CreateJobModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
