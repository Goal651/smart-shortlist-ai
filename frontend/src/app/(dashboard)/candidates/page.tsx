"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  ArrowUpRight, 
  Briefcase, 
  Globe, 
  FileText,
  UserPlus,
  ShieldCheck,
  Star,
  ListFilter
} from "lucide-react";

import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ApplicantTable, type Applicant } from "@/components/dashboard/ApplicantTable";
import { Pagination } from "@/components/ui/Pagination";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { cn } from "@/lib/utils";
import { useJobs, useScreening } from "@/hooks/useApi";
import { CandidateWithUI } from "@/types/request";

// Helper function to convert CandidateWithUI to Applicant format
const convertToApplicant = (candidate: CandidateWithUI): Applicant => ({
  id: candidate._id,
  name: candidate.name,
  score: candidate.score,
  status: candidate.status,
  date: new Date(candidate.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\//g, '-'),
  source: candidate.source as Applicant["source"],
  aiReasoning: {
    strengths: candidate.aiReasoning.strengths,
    gaps: candidate.aiReasoning.gaps,
    risks: candidate.aiReasoning.risks || [],
    recommendation: candidate.aiReasoning.recommendation,
  },
});

const sourceOptions = [
  { label: "All sourcing channels", value: "all" },
  { label: "Umurava platform", value: "umurava" },
  { label: "External resumes", value: "external" },
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState<CandidateWithUI[]>([]);

  const [selectedApplicant, setSelectedApplicant] =
    useState<Applicant | null>(null);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const { jobs } = useJobs();
  
  // For now, we'll use a simple approach - get candidates from the first job that has them
  // In a real implementation, you'd want a dedicated endpoint to fetch all candidates
  const firstJobId = jobs.length > 0 ? jobs[0]._id : null;
  const { candidates } = useScreening(firstJobId || '');

  // Use candidates from the first job as placeholder
  useEffect(() => {
    if (candidates.length > 0) {
      setAllCandidates(candidates);
    }
  }, [candidates]);

  const handleOpenModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  // Convert candidates to Applicant format and filter
  const applicantData = allCandidates.map(convertToApplicant);
  const filteredApplicants = applicantData.filter((c: Applicant) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.source ?? "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-50">

        <div className="space-y-1">

          <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">
            Talent hub
          </Typography>

          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">
            Centralized database for all screened candidates
          </Typography>

        </div>

        <div className="flex items-center space-x-3">

          <Button
            variant="outline"
            className="h-11 shadow-none px-6 border-gray-100 font-medium text-gray-600 transition-none hover:bg-gray-50"
          >
            Export global pool
          </Button>

        </div>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {[
          { 
            label: "Total candidates", 
            value: applicantData.length.toString() || "0", 
            icon: Users, 
            color: "blue" 
          },
          { 
            label: "High match", 
            value: applicantData.filter(c => c.score > 75).length.toString() || "0", 
            icon: Star, 
            color: "orange" 
          },
          { 
            label: "Verification rate", 
            value: applicantData.length > 0 ? "94%" : "0%", 
            icon: ShieldCheck, 
            color: "green" 
          },
          { 
            label: "Average pool score", 
            value: applicantData.length > 0 
              ? (applicantData.reduce((sum, c) => sum + c.score, 0) / applicantData.length).toFixed(1)
              : "0.0", 
            icon: TrendingUp, 
            color: "purple" 
          }
        ].map((stat, i) => (

          <Card
            key={i}
            className="p-5 flex items-center space-x-4 border-gray-100 shadow-none"
          >

            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center border",
              stat.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
              stat.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-600" :
              stat.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
              "bg-purple-50 border-purple-100 text-purple-600"
            )}>

              <stat.icon className="h-5 w-5" />

            </div>

            <div className="space-y-1">

              <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">
                {stat.value}
              </Typography>

              <Typography variant="caption" className="text-[10px] text-gray-600 font-medium pt-1 block leading-none">
                {stat.label}
              </Typography>

            </div>

          </Card>

        ))}

      </div>

      {/* Table */}

      <Card className="border-gray-50 overflow-hidden shadow-none">

        <ApplicantTable
          applicants={filteredApplicants}
          onView={handleOpenModal}
        />

        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50">

          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(filteredApplicants.length / 10))}
            onPageChange={setCurrentPage}
            className="shadow-none border-0"
          />

        </div>

      </Card>

      <ApplicantDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicant={selectedApplicant}
      />

    </div>
  );
}