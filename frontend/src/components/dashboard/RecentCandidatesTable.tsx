"use client";

import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { useJobs, useScreening } from '@/hooks/useApi';
import { CandidateWithUI } from '@/types/request';

const PAGE_SIZE = 5;

interface CandidateWithJob extends CandidateWithUI {
  jobTitle: string;
}

interface RecentCandidatesTableProps {
  currentPage: number;
  onTotalPagesChange: (total: number) => void;
}

export function RecentCandidatesTable({ currentPage, onTotalPagesChange }: RecentCandidatesTableProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentCandidates, setRecentCandidates] = useState<CandidateWithJob[]>([]);

  const { jobs } = useJobs();
  
  // Get candidates from the first job for recent candidates display
  const firstJobId = jobs.length > 0 ? jobs[0]._id : null;
  const { candidates } = useScreening(firstJobId || '');

  useEffect(() => {
    if (candidates.length > 0 && jobs.length > 0) {
      const candidatesWithJob: CandidateWithJob[] = candidates.map(candidate => ({
        ...candidate,
        jobTitle: jobs[0]?.title || 'Unknown Job'
      }));
      setRecentCandidates(candidatesWithJob);
    }
  }, [candidates, jobs]);

  // Notify parent of total pages
  useEffect(() => {
    onTotalPagesChange(Math.max(1, Math.ceil(recentCandidates.length / PAGE_SIZE)));
  }, [recentCandidates.length, onTotalPagesChange]);

  const paged = recentCandidates.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleOpenModal = (applicant: CandidateWithJob) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans">Candidate</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans">Job Title</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Score</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.map((candidate) => (
              <tr key={candidate._id} className="border-b border-gray-50 last:border-0 grow">
                <td className="px-6 py-5">
                  <Typography variant="body" className="text-sm font-medium text-gray-900">{candidate.name}</Typography>
                </td>
                <td className="px-6 py-5">
                  <Typography variant="body" className="text-gray-600 text-sm">{candidate.jobTitle}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center p-1.5 h-8 w-12 rounded-full text-xs font-medium",
                    candidate.score >= 80 ? "bg-green-50 text-green-600 border border-green-100" : 
                    candidate.score >= 70 ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                    {candidate.score}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-xs font-medium border",
                    candidate.status === "Shortlisted" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {candidate.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <Typography variant="body" className="text-gray-600 text-sm whitespace-nowrap">
                    {new Date(candidate.createdAt).toLocaleDateString('en-CA')}
                  </Typography>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => handleOpenModal(candidate)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-all active:scale-95 transition-none"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <ApplicantDetailsModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      applicant={selectedApplicant} 
    />
  </>
);
}
