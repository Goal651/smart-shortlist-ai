// src/app/(dashboard)/candidates/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users, Star, ShieldCheck, TrendingUp
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ApplicantTable, type Applicant } from "@/components/dashboard/ApplicantTable";
import { Pagination } from "@/components/ui/Pagination";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { cn } from "@/lib/utils";
import { useJobs } from "@/hooks/useApi";
import { CandidateWithUI } from "@/types/request";
import { candidateService } from "@/services/candidate";
import { mapCandidateToUI } from "@/contexts/AppContext";

// Converts a raw CandidateWithUI into the Applicant shape the table needs,
// while preserving ALL fields the ApplicantDetailsModal uses so both pages
// show identical modal content.
const convertToApplicant = (candidate: CandidateWithUI): Applicant & Record<string, any> => ({
  // ── Table / Applicant fields ──
  id: candidate._id,
  firstName: candidate.firstName,
  lastName: candidate.lastName,
  name: candidate.name,
  score: candidate.aiAnalysis?.score ?? candidate.score ?? 0,
  status: candidate.status,
  date: new Date(candidate.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).replace(/\//g, '-'),
  source: candidate.source as Applicant["source"],

  // ── Modal fields ──
  email: candidate.email,
  headline: candidate.headline,
  bio: candidate.bio,
  linkedin: candidate.linkedin,
  createdAt: candidate.createdAt,
  extractedText: candidate.extractedText,
  summary: candidate.aiAnalysis?.summary ?? candidate.summary ?? "",
  top_skills: candidate.aiAnalysis?.topSkills ?? candidate.top_skills ?? [],
  gaps: candidate.aiAnalysis?.gaps ?? candidate.gaps ?? [],

  // Pass the full aiAnalysis block (score, summary, topSkills, gaps, reasoning, recommendations)
  aiAnalysis: candidate.aiAnalysis
    ? {
        score: candidate.aiAnalysis.score,
        summary: candidate.aiAnalysis.summary,
        topSkills: candidate.aiAnalysis.topSkills ?? [],
        gaps: candidate.aiAnalysis.gaps ?? [],
        reasoning: candidate.aiAnalysis.reasoning,
        recommendations: candidate.aiAnalysis.recommendations ?? [],
      }
    : undefined,

  // Also map into aiReasoning so the modal's fallback paths all work
  aiReasoning: {
    strengths:
      candidate.aiAnalysis?.topSkills ??
      candidate.aiReasoning?.strengths ??
      candidate.top_skills ?? [],
    gaps:
      candidate.aiAnalysis?.gaps ??
      candidate.aiReasoning?.gaps ??
      candidate.gaps ?? [],
    risks: candidate.aiReasoning?.risks ?? [],
    recommendation:
      candidate.aiAnalysis?.summary ??
      candidate.aiReasoning?.recommendation ??
      candidate.summary ?? "",
    insights:
      candidate.aiAnalysis?.reasoning ??
      (candidate.aiReasoning as any)?.insights ?? "",
    recommendations:
      candidate.aiAnalysis?.recommendations ??
      candidate.aiReasoning?.recommendations ?? [],
  },
});

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [allCandidates, setAllCandidates] = useState<CandidateWithUI[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<ReturnType<typeof convertToApplicant> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { jobs } = useJobs();

  useEffect(() => {
    const fetchAllCandidates = async () => {
      try {
        const response = await candidateService.getAllCandidates();
        if (response.success && response.data) {
          const candidatesWithUI = response.data.map(mapCandidateToUI);
          setAllCandidates(candidatesWithUI);
        }
      } catch (error) {
        console.error("Failed to fetch all candidates:", error);
      }
    };
    fetchAllCandidates();
  }, []);

  const handleOpenModal = (applicant: Applicant) => {
    setSelectedApplicant(applicant as ReturnType<typeof convertToApplicant>);
    setIsModalOpen(true);
  };

  const PAGE_SIZE = 10;
  const applicantData = allCandidates.map(convertToApplicant);
  const filteredApplicants = applicantData.filter((c) =>
    (c.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.source ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredApplicants.length / PAGE_SIZE));
  const pagedApplicants = filteredApplicants.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-50">
        <div className="space-y-1">
          <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">
            Talent Hub
          </Typography>
          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">
            Centralized database for all screened candidates
          </Typography>
        </div>
        <Button variant="outline" className="h-11 shadow-none px-6 border-gray-100 font-medium text-gray-600 hover:bg-gray-50">
          Export global pool
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total candidates",
            value: applicantData.length.toString(),
            icon: Users,
            color: "blue",
          },
          {
            label: "High match",
            value: applicantData.filter(c => c.score > 75).length.toString(),
            icon: Star,
            color: "orange",
          },
          {
            label: "Verification rate",
            value: applicantData.length > 0 ? "94%" : "0%",
            icon: ShieldCheck,
            color: "green",
          },
          {
            label: "Average pool score",
            value: applicantData.length > 0
              ? (applicantData.reduce((sum, c) => sum + c.score, 0) / applicantData.length).toFixed(1)
              : "0.0",
            icon: TrendingUp,
            color: "purple",
          },
        ].map((stat, i) => (
          <Card key={i} className="p-5 flex items-center space-x-4 border-gray-100 shadow-none">
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
              <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">{stat.value}</Typography>
              <Typography variant="caption" className="text-[10px] text-gray-600 font-medium pt-1 block leading-none">{stat.label}</Typography>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-gray-50 overflow-hidden shadow-none">
        <ApplicantTable applicants={pagedApplicants} onView={handleOpenModal} />
        <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
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