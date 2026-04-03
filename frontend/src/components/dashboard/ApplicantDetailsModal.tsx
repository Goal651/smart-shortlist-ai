"use client";

import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { User, Mail, Calendar, Briefcase, GraduationCap, Award, Sparkles } from "lucide-react";
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
    jobTitle?: string;
    aiReasoning?: string;
  } | null;
}

export function ApplicantDetailsModal({ isOpen, onClose, applicant }: ApplicantDetailsModalProps) {
  if (!applicant) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Applicant Details" className="max-w-3xl">
      <div className="space-y-6">
        {/* Profile Info Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-0.5">
              <Typography variant="h3" className="text-xl font-semibold text-gray-900">{applicant.name}</Typography>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <Typography variant="caption" className="text-xs font-medium">{applicant.name.toLowerCase().replace(" ", ".")}@example.com</Typography>
              </div>
            </div>
          </div>
          <div className="text-center space-y-1.5 pt-1">
             <div className={cn(
                "h-14 w-14 rounded-2xl flex flex-col items-center justify-center border animate-in zoom-in-50 duration-500",
                applicant.score >= 80 ? "bg-green-50 text-green-600 border-green-100" : 
                applicant.score >= 70 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-red-50 text-red-600 border-red-100"
             )}>
                <Typography variant="h2" className="text-lg font-semibold leading-none">{applicant.score}</Typography>
                <Typography variant="small" className="text-[9px] font-semibold uppercase tracking-wider opacity-70">Score</Typography>
             </div>
             <span className={cn(
                "block px-3 py-0.5 rounded-full text-[10px] font-semibold border",
                applicant.status === "Shortlisted" ? "bg-green-50 text-green-600 border-green-100" : "bg-orange-50 text-orange-600 border-orange-100"
             )}>
                {applicant.status}
             </span>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <Typography variant="body" className="font-semibold text-sm">Experience</Typography>
                 </div>
                 <div className="space-y-3 pl-6 border-l-2 border-gray-50 ml-2">
                    <div className="space-y-0.5">
                       <Typography variant="body" className="text-sm font-semibold text-gray-900">Senior React Developer</Typography>
                       <Typography variant="caption" className="text-gray-600 text-[11px]">TechSolutions Inc • 2021 - Present</Typography>
                    </div>
                    <div className="space-y-0.5">
                       <Typography variant="body" className="text-sm font-semibold text-gray-900">Frontend Developer</Typography>
                       <Typography variant="caption" className="text-gray-600 text-[11px]">Creative Agency • 2018 - 2021</Typography>
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <Typography variant="body" className="font-semibold text-sm">Education</Typography>
                 </div>
                 <div className="space-y-3 pl-6 border-l-2 border-gray-50 ml-2">
                    <div className="space-y-0.5">
                       <Typography variant="body" className="text-sm font-semibold text-gray-900">BSc in Computer Science</Typography>
                       <Typography variant="caption" className="text-gray-600 text-[11px]">University of Rwanda • 2014 - 2018</Typography>
                    </div>
                 </div>
              </div>

              <div className="space-y-1.5">
                 <div className="flex items-center space-x-2 text-gray-900">
                    <Award className="h-4 w-4 text-primary" />
                    <Typography variant="body" className="font-semibold text-sm">Summary</Typography>
                 </div>
                 <Typography variant="body" className="text-xs text-gray-600 leading-relaxed font-work-sans">
                    Highly skilled software engineer with 5+ years of experience in modern web technologies. Expert in React, TypeScript, and functional programming.
                 </Typography>
              </div>
           </div>
        </div>

        {/* AI Reasoning Section */}
        <div className="p-5 bg-blue-50/20 rounded-2xl border border-blue-50/50 space-y-3">
           <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-primary">
                 <Sparkles className="h-4 w-4 fill-primary/20" />
                 <Typography variant="body" className="font-semibold text-sm">AI Screening Logic</Typography>
              </div>
              <span className="px-2.5 py-0.5 bg-primary text-white rounded-full text-[8px] font-semibold uppercase tracking-wider">AI Insight</span>
           </div>
           <Typography variant="body" className="text-[13px] text-gray-700 leading-relaxed font-medium font-work-sans">
             {applicant.aiReasoning || "This candidate is a top match due to their 5+ years of experience with React and proven leadership in previous frontend roles. Their technical score reflects an exceptional grasp of system architecture and performance optimization."}
           </Typography>
        </div>

        {/* Action Footer */}
        <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
           <div className="flex items-center space-x-3 text-gray-600">
              <Calendar className="h-4 w-4" />
              <Typography variant="caption" className="text-xs font-medium">Applied on {applicant.date}</Typography>
           </div>
           <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none border-gray-100 h-10 px-5 shadow-none text-xs font-semibold hover:border-primary/20 transition-none">Download CV</Button>
              <Button className="flex-1 sm:flex-none h-10 px-6 shadow-none font-semibold text-xs transition-none">Shortlist Candidate</Button>
           </div>
        </div>
      </div>
    </Modal>
  );
}
