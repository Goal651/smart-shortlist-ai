"use client";

import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";

export type ApplicantSource =
  | "Umurava Profile"
  | "External PDF"
  | "CSV Upload";

export interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  name?: string;
  score: number;
  status: string;
  date: string;
  source?: ApplicantSource;

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

export function ApplicantTable({
  applicants,
  onView,
}: ApplicantTableProps) {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-left">
                Candidate Name
              </th>

              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-center">
                Score
              </th>

              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-center">
                Status
              </th>

              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-center">
                Date Applied
              </th>

              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-center">
                Source
              </th>

              <th className="px-6 py-4 text-xs font-medium text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {applicants.map((applicant) => (
              <tr
                key={applicant.id}
                className="border-b border-gray-50 last:border-0 group"
              >
                <td className="px-6 py-5">
                  <Typography
                    variant="body"
                    className="text-sm font-medium text-gray-900 group-hover:text-primary"
                  >
                    {applicant.firstName && applicant.lastName 
                      ? `${applicant.firstName} ${applicant.lastName}` 
                      : applicant.name || "Candidate"}
                  </Typography>
                </td>

                <td className="px-6 py-5 text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center p-1.5 h-8 w-12 rounded-full text-xs font-medium border",
                      applicant.score >= 80
                        ? "bg-green-50 text-green-600 border-green-100"
                        : applicant.score >= 70
                        ? "bg-orange-50 text-orange-600 border-orange-100"
                        : "bg-red-50 text-red-600 border-red-100"
                    )}
                  >
                    {(applicant as any).aiAnalysis?.score ?? applicant.score ?? 0}
                  </div>
                </td>

                <td className="px-6 py-5 text-center">
                  <span
                    className={cn(
                      "px-4 py-1 rounded-full text-xs font-medium border",
                      applicant.status === "Shortlisted"
                        ? "bg-green-50 text-green-600 border-green-100"
                        : applicant.status === "Review" ||
                          applicant.status === "Reviewing"
                        ? "bg-orange-50 text-orange-600 border-orange-100"
                        : "bg-gray-50 text-gray-600 border-gray-100"
                    )}
                  >
                    {applicant.status}
                  </span>
                </td>

                <td className="px-6 py-5 text-center">
                  <Typography
                    variant="body"
                    className="text-gray-600 text-sm font-medium whitespace-nowrap"
                  >
                    {applicant.date}
                  </Typography>
                </td>

                <td className="px-6 py-5 text-center">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-medium border",
                      applicant.source === "Umurava Profile"
                        ? "bg-primary/5 text-primary border-primary/10"
                        : "bg-orange-50 text-orange-600 border-orange-100"
                    )}
                  >
                    {applicant.source || "Umurava Profile"}
                  </span>
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    onClick={() => onView?.(applicant)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-xl border border-gray-100 text-sm font-medium text-gray-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
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
  );
}