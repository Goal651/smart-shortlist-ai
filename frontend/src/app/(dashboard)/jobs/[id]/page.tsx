"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Search, Star, TrendingUp, Users, CheckCircle2, Sparkles, FileText, Info, Loader2, AlertCircle, ListFilter } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApplicantTable } from "@/components/dashboard/ApplicantTable";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";
import { Pagination } from "@/components/ui/Pagination";

const topCandidatesData: any[] = [
  { 
    id: "1", 
    name: "Alice Mukamana", 
    score: 92, 
    status: "Shortlisted", 
    date: "2026-03-29", 
    source: "Umurava Profile",
    aiReasoning: {
      strengths: ["Exceptional React/TypeScript architecture", "Proven leadership in frontend teams", "Strong performance optimization track record"],
      gaps: ["Limited experience with specific GraphQL sub-libraries"],
      risks: ["Higher salary expectations than mid-range"],
      recommendation: "Top-tier candidate. Immediate move to technical interview recommended."
    }
  },
  { 
    id: "2", 
    name: "Patrick Niyonzima", 
    score: 88, 
    status: "Shortlisted", 
    date: "2026-03-27", 
    source: "External PDF",
    aiReasoning: {
      strengths: ["Strong UI/UX systems knowledge", "Solid enterprise React experience"],
      gaps: ["Lacks unit testing leadership"],
      risks: ["Currently based in a different timezone"],
      recommendation: "Strong match for design-system oriented engineering tasks."
    }
  },
  { 
    id: "3", 
    name: "Jean Baptiste", 
    score: 85, 
    status: "Shortlisted", 
    date: "2026-03-29", 
    source: "Umurava Profile",
    aiReasoning: {
       strengths: ["Clean code champion", "Good test coverage logic", "Collaborative mindset"],
       gaps: ["Limited cloud dev experience"],
       risks: ["None identified"],
       recommendation: "Strong candidate for middle-to-senior role transition."
    }
  },
  { id: "7", name: "Grace Uwimana", score: 84, status: "Shortlisted", date: "2026-03-28", source: "CSV Upload" },
  { id: "8", name: "Innocent N.", score: 83, status: "Shortlisted", date: "2026-03-25", source: "Umurava Profile" },
  { id: "9", name: "Solange U.", score: 82, status: "Shortlisted", date: "2026-03-24", source: "External PDF" },
  { id: "10", name: "Kevin G.", score: 81, status: "Shortlisted", date: "2026-03-23", source: "Umurava Profile" },
  { id: "11", name: "Fifi M.", score: 80, status: "Shortlisted", date: "2026-03-22", source: "Umurava Profile" },
  { id: "12", name: "Didier K.", score: 79, status: "Shortlisted", date: "2026-03-21", source: "CSV Upload" },
  { id: "13", name: "Clarisse U.", score: 78, status: "Shortlisted", date: "2026-03-20", source: "External PDF" },
];

const allApplicantsData = [
  ...topCandidatesData,
  { id: "4", name: "Grace Uwimana", score: 78, status: "Reviewing", date: "2026-03-28", source: "Umurava Profile" },
  { id: "5", name: "Diane Iradukunda", score: 65, status: "Reviewing", date: "2026-03-29", source: "External PDF" },
  { id: "6", name: "John Doe", score: 45, status: "Rejected", date: "2026-03-25", source: "CSV Upload" },
];

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [hasScreened, setHasScreened] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleOpenModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleRunScreening = () => {
    setIsScreening(true);
    setTimeout(() => {
      setIsScreening(false);
      setHasScreened(true);
    }, 2500);
  };

  const statusOptions = [
    { label: "All Applicants", value: "all" },
    { label: "Shortlisted", value: "shortlisted" },
    { label: "Reviewing", value: "reviewing" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Back & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <Typography variant="small" className="font-medium">Back to Jobs</Typography>
          </button>
          <div className="space-y-1">
              <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Senior Frontend Engineer</Typography>
              <div className="flex items-center space-x-3">
                 <Typography variant="body" className="text-primary font-medium text-sm">Umurava</Typography>
                 <span className="h-1 w-1 rounded-full bg-gray-300" />
                 <Typography variant="caption" className="text-gray-600 font-medium text-xs">Remote • Full-time</Typography>
              </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
           <Button 
            variant="outline" 
            onClick={() => setIsEditModalOpen(true)}
            className="h-11 shadow-none px-6 border-gray-100 font-medium text-gray-600 transition-none hover:border-primary/20"
           >
              Edit Job
           </Button>
           <Button 
            onClick={handleRunScreening}
            disabled={isScreening || hasScreened}
            className={cn(
              "h-11 shadow-none px-8 font-medium transition-none gap-2",
              hasScreened && "bg-green-50 text-green-600 border border-green-100 hover:bg-green-50 cursor-default"
            )}
           >
              {isScreening ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Screening...
                </>
              ) : hasScreened ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Screening Complete
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Screen with Gemini AI
                </>
              )}
           </Button>
        </div>
      </div>

      {/* Main Grid: Description and Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Side: Job Context and Analysis */}
         <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4 border-gray-100 shadow-none">
                <div className="flex items-center space-x-2 text-gray-900">
                    <FileText className="h-4 w-4 text-primary" />
                    <Typography variant="body" className="font-medium text-sm tracking-wider">Job Description</Typography>
                </div>
                <Typography variant="body" className="text-sm text-gray-600 leading-relaxed font-work-sans">
                    We are looking for an experienced Senior Frontend Engineer to lead the development of our next-generation AI recruitment platform. You will be responsible for defining architectural patterns, mentoring junior engineers, and ensuring a premium user experience across all devices.
                </Typography>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                   {[
                      { label: "Required Experience", value: "5+ Years" },
                      { label: "Tech Stack", value: "React, TypeScript, Next.js" },
                      { label: "Budget Range", value: "$2.5k - $4k / mo" }
                   ].map((item, i) => (
                      <div key={i} className="space-y-1">
                        <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">{item.label}</Typography>
                        <Typography variant="body" className="text-xs font-medium text-gray-700">{item.value}</Typography>
                      </div>
                   ))}
                </div>
            </Card>

            {/* AI Analysis Report Card */}
            {hasScreened ? (
              <Card className="p-6 border-primary/20 bg-primary/[0.02] space-y-6 animate-in slide-in-from-top-4 duration-500 shadow-none">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Sparkles className="h-5 w-5" />
                       </div>
                       <div className="space-y-0.5">
                          <Typography variant="h3" className="text-lg font-medium text-gray-900">Gemini Screening Report</Typography>
                          <Typography variant="caption" className="text-xs text-gray-600 font-medium">Pool Analysis: 24 candidates across 3 sourcing channels</Typography>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <Typography variant="body" className="font-medium text-xs text-gray-900 tracking-widest bg-white border border-gray-100 w-fit px-3 py-1 rounded-lg">Top High-Match Grid</Typography>
                       <div className="grid grid-cols-5 md:grid-cols-10 lg:grid-cols-5 gap-2.5">
                          {topCandidatesData.slice(0, 10).map((c) => (
                            <button 
                              key={c.id} 
                              onClick={() => handleOpenModal(c)}
                              className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[11px] font-medium text-primary hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-95 transition-none shadow-none" 
                              title={c.name}
                            >
                              {c.score}
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <Typography variant="body" className="font-medium text-xs text-gray-900">Primary Analysis Points</Typography>
                          <div className="flex flex-wrap gap-2">
                             {["Next.js", "Lead Exp", "Architecture"].map((point, i) => (
                                <span key={i} className="px-2.5 py-1 bg-white border border-gray-100 text-[10px] font-medium text-gray-600 rounded-lg">{point}</span>
                             ))}
                          </div>
                       </div>
                       <div className="space-y-1.5 border-t border-gray-100/50 pt-3">
                          <Typography variant="body" className="font-medium text-[10px] text-gray-600">Gemini Executive Summary</Typography>
                          <Typography variant="body" className="text-[12px] text-gray-700 leading-relaxed font-medium italic">
                             "10 candidates exceed the &gt;75 score threshold. We recommend focusing on the Top 3 for immediate technical screening."
                          </Typography>
                       </div>
                    </div>
                 </div>
              </Card>
            ) : (
                <Card className="p-8 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center space-y-4 shadow-none">
                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-gray-300 border border-gray-100">
                        <Info className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <Typography variant="h3" className="text-base font-medium text-gray-900">Analysis Pending</Typography>
                        <Typography variant="caption" className="text-sm text-gray-600 max-w-sm">
                            Execute Gemini AI screening to rank applicants and generate detailed analysis reports.
                        </Typography>
                    </div>
                    <Button onClick={handleRunScreening} variant="outline" className="h-10 px-6 border-gray-200 text-gray-600 transition-none font-medium text-xs hover:border-primary/20">Start Screening Now</Button>
                </Card>
            )}
         </div>

         {/* Right Side: Stats Panel */}
         <div className="space-y-4">
            {[
               { label: "Total Applicants", value: "24", icon: Users, color: "blue", active: true },
               { label: "Shortlisted", value: hasScreened ? "10" : "0", icon: CheckCircle2, color: "green", active: hasScreened },
               { label: "Avg AI Score", value: hasScreened ? "82%" : "--", icon: TrendingUp, color: "orange", active: hasScreened }
            ].map((stat, i) => (
               <Card key={i} className={cn(
                 "p-5 flex items-center space-x-4 border-gray-100 transition-all duration-700 shadow-none",
                 !stat.active && "opacity-50 grayscale-[0.5]"
               )}>
                  <div className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center border",
                    stat.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                    stat.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                    "bg-orange-50 border-orange-100 text-orange-600"
                  )}>
                     <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                     <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">{stat.value}</Typography>
                     <Typography variant="caption" className="text-[10px] text-gray-600 font-medium tracking-wider pt-1 block">{stat.label}</Typography>
                  </div>
               </Card>
            ))}

            {hasScreened && (
               <Card className="p-5 border-primary/20 bg-primary/5 space-y-4 animate-in fade-in duration-700 shadow-none">
                  <Typography variant="body" className="font-medium text-xs text-primary">Quick Actions</Typography>
                  <div className="grid grid-cols-1 gap-2">
                     <Button className="w-full h-10 shadow-none text-xs font-medium">Generate Full Report</Button>
                     <Button variant="outline" className="w-full h-10 shadow-none text-xs font-medium bg-white border-gray-100">Send Shortlist Email</Button>
                  </div>
               </Card>
            )}
         </div>
      </div>

      {/* Top Ranked Candidates Section (As per User request: "page defining what ai just screened") */}
      {hasScreened && (
        <div className="space-y-6 pt-4 animate-in slide-in-from-bottom-6 duration-700">
           <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                 <Star className="h-5 w-5 text-orange-400 fill-orange-400" />
                 <Typography variant="h2" className="text-xl font-medium text-gray-900 font-dm-sans">Top Ranked Candidates</Typography>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {topCandidatesData.slice(0, 10).map((candidate) => (
                <button 
                  key={candidate.id} 
                  onClick={() => handleOpenModal(candidate)}
                  className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col items-center text-center space-y-3 transition-all group transition-none active:scale-95 shadow-none hover:border-primary/20"
                >
                   <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-primary/20 group-hover:bg-primary/5 transition-all">
                      <Typography variant="h3" className="text-sm font-medium text-primary">{candidate.score}</Typography>
                   </div>
                   <div className="space-y-0.5">
                      <Typography variant="body" className="text-xs font-medium text-gray-900 truncate w-32">{candidate.name}</Typography>
                      <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">{candidate.source || "External"}</Typography>
                   </div>
                   <span className="text-[8px] font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                      High Match
                   </span>
                </button>
              ))}
           </div>
        </div>
      )}

      {/* Full Applicant Pool Section (Wait-List) */}
      <div className="space-y-6 pt-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
               <ListFilter className="h-5 w-5 text-gray-600" />
               <Typography variant="h2" className="text-xl font-medium text-gray-900 font-dm-sans">Applicant Pool</Typography>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
               <div className="relative flex-1 sm:w-80 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="Search all candidates..." 
                    className="w-full h-11 bg-white border border-gray-100 rounded-xl pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="w-full sm:w-48">
                  <Select 
                    options={statusOptions} 
                    value={selectedStatus} 
                    onChange={setSelectedStatus} 
                    placeholder="Status Filter" 
                  />
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <ApplicantTable applicants={allApplicantsData} onView={handleOpenModal} />
            <Pagination 
              currentPage={currentPage} 
              totalPages={3} 
              onPageChange={setCurrentPage}
              className="border border-gray-100 border-x-0 bg-gray-50/30"
            />
         </div>
      </div>

      <ApplicantDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicant={selectedApplicant} 
      />

      <CreateJobModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        isEdit 
      />
    </div>
  );
}
