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
    _id?: string;
    id?: string;
    name: string;
    score: number;
    summary?: string;
    top_skills?: string[];
    gaps?: string[];
    status: 'Shortlisted' | 'Review' | 'Rejected' | string;
    email?: string;
    linkedin?: string;
    createdAt?: string;
    extractedText?: string;
    source?: string;
    aiReasoning?: {
      strengths: string[];
      gaps: string[];
      risks?: string[];
      recommendation: string;
    };
  } | null;
}

export function ApplicantDetailsModal({ isOpen, onClose, applicant }: ApplicantDetailsModalProps) {
  if (!applicant) return null;

  // Build reasoning from real candidate data
  const reasoning = applicant.aiReasoning ? {
    strengths: applicant.aiReasoning.strengths,
    gaps: applicant.aiReasoning.gaps,
    risks: applicant.aiReasoning.risks || [],
    recommendation: applicant.aiReasoning.recommendation,
  } : {
    strengths: applicant.top_skills && applicant.top_skills.length > 0 
      ? applicant.top_skills.slice(0, 2).map(skill => `Strong ${skill} skill`)
      : ["Strong technical foundation", "Relevant experience"],
    gaps: applicant.gaps ? applicant.gaps.slice(0, 2) : [],
    risks: applicant.gaps ? applicant.gaps.slice(2, 3) : [],
    recommendation: applicant.score >= 85 
      ? "Highly recommended for further interview based on strong skills match."
      : applicant.score >= 70 
      ? "Recommended with minor skill gaps. Consider for technical assessment."
      : "Needs further evaluation. Skills alignment is moderate."
  };

  const appliedDate = applicant.createdAt 
    ? new Date(applicant.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : "Recently";

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
                    {applicant.source || "External PDF"}
                  </span>
               </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-3 w-3" />
                <Typography variant="caption" className="text-[11px] font-medium">{applicant.email || 'Not provided'}</Typography>
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
             <Typography variant="caption" className="text-[9px] text-gray-600 text-center block">Applied {appliedDate}</Typography>
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

        {/* Detailed Info (Skills & Summary) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Award className="h-3.5 w-3.5 text-primary" />
                    <Typography variant="body" className="font-medium text-xs text-gray-600 tracking-widest">Top Skills</Typography>
                 </div>
                 <div className="space-y-2 pl-5 border-l border-gray-100 ml-1.5">
                    {(applicant.top_skills && applicant.top_skills.length > 0) ? (
                      applicant.top_skills.slice(0, 5).map((skill, i) => (
                        <div key={i} className="space-y-0.5">
                           <Typography variant="body" className="text-[11px] font-medium text-gray-900">{skill}</Typography>
                        </div>
                      ))
                    ) : (
                      <Typography variant="body" className="text-[11px] text-gray-600 italic">No skills extracted</Typography>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <Typography variant="body" className="font-medium text-[10px] text-gray-600 tracking-widest">Candidate Summary</Typography>
                 </div>
                 <Typography variant="body" className="text-[11px] text-gray-600 leading-relaxed font-work-sans">
                    {applicant.summary || "No summary available"}
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
