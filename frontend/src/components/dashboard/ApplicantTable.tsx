"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { Eye, ChevronRight } from "lucide-react";

interface Applicant {
  id: string;
  name: string;
  score: number;
  status: string;
  date: string;
  source?: "Umurava Profile" | "External PDF" | "CSV Upload";
  aiReasoning?: {
    strengths: string[];
    gaps: string[];
    risks: string[];
    recommendation: string;
  };
}

interface ApplicantTableProps {
  applicants: Applicant[];
  onView?: (applicant: Applicant) => void;
}

export function ApplicantTable({ applicants, onView }: ApplicantTableProps) {

  return (
    <>
      <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans">Candidate Name</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Score</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Date Applied</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Source</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applicants.map((applicant) => (
                <tr key={applicant.id} className="border-b border-gray-50 last:border-0 group transition-all">
                  <td className="px-6 py-5">
                    <Typography variant="body" className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">{applicant.name}</Typography>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center p-1.5 h-8 w-12 rounded-full text-xs font-medium transition-all",
                      applicant.score >= 80 ? "bg-green-50 text-green-600 border border-green-100" : 
                      applicant.score >= 70 ? "bg-orange-50 text-orange-600 border border-orange-100" : "bg-red-50 text-red-600 border border-red-100"
                    )}>
                      {applicant.score}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "px-4 py-1 rounded-full text-xs font-medium border transition-all",
                      applicant.status === "Shortlisted" ? "bg-green-50 text-green-600 border-green-100" : 
                      applicant.status === "Review" || applicant.status === "Reviewing" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-gray-50 text-gray-600 border-gray-100"
                    )}>
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <Typography variant="body" className="text-gray-600 text-sm whitespace-nowrap font-medium">{applicant.date}</Typography>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-medium border",
                      applicant.source === "Umurava Profile" ? "bg-primary/5 text-primary border-primary/10" : "bg-orange-50 text-orange-600 border-orange-100"
                    )}>
                      {applicant.source || "Umurava Profile"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => onView?.(applicant)}
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
    </>
  );
}
