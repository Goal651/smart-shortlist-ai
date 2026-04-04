"use client";

import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { User, Mail, Calendar, Briefcase, GraduationCap, Award, Sparkles, CheckCircle2, AlertCircle, TrendingUp, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicantDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: {
    id: string;
    name: string;
    score: number;
    status: string;
    date: string;
    source?: "Umurava Profile" | "External PDF" | "CSV Upload";
    jobTitle?: string;
    aiReasoning?: {
      strengths: string[];
      gaps: string[];
      risks: string[];
      recommendation: string;
    };
  } | null;
}

export function ApplicantDetailsModal({ isOpen, onClose, applicant }: ApplicantDetailsModalProps) {
  if (!applicant) return null;

  const defaultReasoning = {
    strengths: ["Strong technical foundation", "5+ years of relevant experience"],
    gaps: ["No direct experience with the specific cloud stack"],
    risks: ["Location transition requirements"],
    recommendation: "Highly recommended for further interview based on technical score and experience depth."
  };

  const reasoning = applicant.aiReasoning || defaultReasoning;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Applicant Analysis Report" className="max-w-4xl">
      <div className="space-y-5">
        {/* Profile Info Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 pb-4 border-b border-gray-50">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 relative shadow-none">
              <User className="h-7 w-7 text-gray-600" />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-lg border border-gray-100 shadow-none">
                {applicant.source === "Umurava Profile" ? (
                  <Globe className="h-2.5 w-2.5 text-primary" />
                ) : (
                  <Briefcase className="h-2.5 w-2.5 text-orange-400" />
                )}
              </div>
            </div>
            <div className="space-y-0.5">
               <div className="flex items-center space-x-2">
                  <Typography variant="h3" className="text-lg font-medium text-gray-900">{applicant.name}</Typography>
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-lg text-[9px] font-medium border border-gray-100">
                    {applicant.source || "Umurava Profile"}
                  </span>
               </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-3 w-3" />
                <Typography variant="caption" className="text-[11px] font-medium">{applicant.name.toLowerCase().replace(" ", ".")}@example.com</Typography>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className={cn(
                "h-12 w-12 rounded-xl flex flex-col items-center justify-center border transition-all shadow-none",
                applicant.score >= 80 ? "bg-green-50 text-green-600 border-green-100" : 
                applicant.score >= 70 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-red-50 text-red-600 border-red-100"
             )}>
                <Typography variant="h2" className="text-base font-medium leading-none">{applicant.score}</Typography>
                <Typography variant="small" className="text-[8px] font-medium tracking-tighter opacity-70">Match</Typography>
             </div>
             <div className="space-y-1">
                <span className={cn(
                   "block px-2.5 py-0.5 rounded-full text-[9px] font-medium border text-center",
                   applicant.status === "Shortlisted" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
                )}>
                   {applicant.status}
                </span>
                <Typography variant="caption" className="text-[9px] text-gray-600 text-center block">Applied {applicant.date}</Typography>
             </div>
          </div>
        </div>

        {/* AI Detailed Screening Logic (As per SRS Section 6) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card className="p-4 bg-green-50/10 border-green-100/50 space-y-3 shadow-none">
              <div className="flex items-center space-x-2 text-green-600">
                 <CheckCircle2 className="h-3.5 w-3.5" />
                 <Typography variant="body" className="font-medium text-[10px] tracking-wider">Top Strengths</Typography>
              </div>
              <ul className="space-y-1.5">
                  {reasoning.strengths.slice(0, 2).map((s, i) => (
                     <li key={i} className="flex items-start space-x-2">
                        <span className="h-1 w-1 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                        <Typography variant="body" className="text-[11px] text-gray-700 leading-tight">{s}</Typography>
                     </li>
                  ))}
              </ul>
           </Card>

           <Card className="p-4 bg-orange-50/10 border-orange-100/50 space-y-3 shadow-none">
              <div className="flex items-center space-x-2 text-orange-600">
                 <AlertCircle className="h-3.5 w-3.5" />
                 <Typography variant="body" className="font-medium text-[10px] tracking-wider">Gaps & Risks</Typography>
              </div>
              <ul className="space-y-1.5">
                  {(reasoning.gaps.slice(0, 1).concat(reasoning.risks.slice(0, 1))).map((g, i) => (
                     <li key={i} className="flex items-start space-x-2">
                        <span className="h-1 w-1 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                        <Typography variant="body" className="text-[11px] text-gray-700 leading-tight">{g}</Typography>
                     </li>
                  ))}
              </ul>
           </Card>

           <Card className="p-4 bg-blue-50/10 border-blue-100/50 space-y-3 shadow-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary">
                   <Sparkles className="h-3.5 w-3.5 fill-primary/20" />
                   <Typography variant="body" className="font-medium text-[10px] tracking-wider">Gemini Verdict</Typography>
                </div>
              </div>
              <Typography variant="body" className="text-[11px] text-gray-700 leading-relaxed font-medium italic">
                 "{reasoning.recommendation.split('.')[0]}."
              </Typography>
           </Card>
        </div>

        {/* Detailed Info (Experience & Education) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <Typography variant="body" className="font-medium text-xs text-gray-600 tracking-widest">Experience History</Typography>
                 </div>
                 <div className="space-y-3 pl-5 border-l border-gray-100 ml-1.5">
                    <div className="space-y-0.5">
                       <Typography variant="body" className="text-[11px] font-medium text-gray-900">Senior React Developer</Typography>
                       <Typography variant="caption" className="text-gray-600 text-[10px]">TechSolutions Inc • 2021 - Present</Typography>
                    </div>
                    <div className="space-y-0.5">
                       <Typography variant="body" className="text-[11px] font-medium text-gray-900">Frontend Developer</Typography>
                       <Typography variant="caption" className="text-gray-600 text-[10px]">Creative Agency • 2018 - 2021</Typography>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    <Typography variant="body" className="font-medium text-xs text-gray-600 tracking-widest">Education</Typography>
                 </div>
                 <div className="space-y-0.5 pl-5 border-l border-gray-100 ml-1.5">
                    <Typography variant="body" className="text-[11px] font-medium text-gray-900">BSc in Computer Science</Typography>
                    <Typography variant="caption" className="text-gray-600 text-[10px]">University of Rwanda • 2014 - 2018</Typography>
                 </div>
              </div>
              <div className="space-y-1.5">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <Typography variant="body" className="font-medium text-[10px] text-gray-600 tracking-widest">Candidate Summary</Typography>
                 </div>
                 <Typography variant="body" className="text-[11px] text-gray-600 leading-relaxed font-work-sans">
                    Highly skilled engineer with 5+ years of experience in modern web technologies. Expert in React and TypeScript.
                 </Typography>
              </div>
           </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
           <div className="flex items-center space-x-2 text-primary bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10">
              <Sparkles className="h-3 w-3" />
              <Typography variant="caption" className="text-[9px] font-medium tracking-widest italic">Analyzed by Gemini Pro</Typography>
           </div>
           <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none border-gray-100 h-9 px-4 shadow-none text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-none">Close</Button>
              <Button className="flex-1 sm:flex-none h-9 px-5 shadow-none font-medium text-[11px] transition-none">Proceed to Shortlist</Button>
           </div>
        </div>
      </div>
    </Modal>
  );
}
