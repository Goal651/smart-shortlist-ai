"use client";

import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { useJobs } from '@/hooks/useApi';
import { CandidateWithUI } from '@/types/request';
import { candidateService } from '@/services/candidate';
import { mapCandidateToUI } from '@/contexts/AppContext';

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
  const [matchLimit, setMatchLimit] = useState<number>(5);

  const { jobs } = useJobs();

  useEffect(() => {
    const fetchRecentCandidates = async () => {
      try {
        const response = await candidateService.getAllCandidates();
        if (response.success && response.data) {
          const candidatesWithJob: CandidateWithJob[] = response.data.map(candidate => {
            const uiCandidate = mapCandidateToUI(candidate);
            const job = jobs.find(j => j._id === candidate.jobId);
            return {
              ...uiCandidate,
              jobTitle: job?.title || 'Unknown Job'
            };
          });
          setRecentCandidates(candidatesWithJob);
        }
      } catch (error) {
        console.error("Failed to fetch recent candidates:", error);
      }
    };

    fetchRecentCandidates();
  }, [jobs]);

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
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h2" className="text-lg font-medium text-gray-900">Recent Candidates</Typography>
        <div className="flex items-center space-x-2">
          <Typography variant="caption" className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Show Top</Typography>
          <select 
            value={matchLimit} 
            onChange={(e) => setMatchLimit(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>
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
            {recentCandidates.slice(0, matchLimit).map((candidate) => (
              <tr key={candidate._id} className="border-b border-gray-50 last:border-0 grow">
                <td className="px-6 py-5">
                  <Typography variant="body" className="text-sm font-medium text-gray-900">
                    {candidate.firstName && candidate.lastName 
                      ? `${candidate.firstName} ${candidate.lastName}` 
                      : candidate.name || "Candidate"}
                  </Typography>
                </td>
                <td className="px-6 py-5">
                  <Typography variant="body" className="text-gray-600 text-sm">{candidate.jobTitle}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center p-1.5 h-8 w-12 rounded-full text-xs font-medium",
                    (candidate.aiAnalysis?.score ?? candidate.score ?? 0) >= 80 ? "bg-green-50 text-green-600 border border-green-100" : 
                    (candidate.aiAnalysis?.score ?? candidate.score ?? 0) >= 70 ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-red-50 text-red-600 border border-red-100"
                  )}>
                    {candidate.aiAnalysis?.score ?? candidate.score ?? 0}
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
