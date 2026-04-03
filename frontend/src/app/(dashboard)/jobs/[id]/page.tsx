"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Search, Star, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApplicantTable } from "@/components/dashboard/ApplicantTable";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";

const topCandidatesData = [
  { id: "1", name: "Alice Mukamana", score: 92, status: "Shortlisted", date: "2026-03-29", aiReasoning: "Exceptional frontend expertise with 6 years of experience. High proficiency in React/TypeScript architecture and performance optimization." },
  { id: "2", name: "Patrick Niyonzima", score: 88, status: "Shortlisted", date: "2026-03-27", aiReasoning: "Strong UI/UX background combined with solid React skills. Highly recommended for design-system oriented engineering tasks." },
  { id: "3", name: "Jean Baptiste", score: 85, status: "Shortlisted", date: "2026-03-29", aiReasoning: "Very strong technical foundation and experience with enterprise-scale frontend applications. Excellent problem-solving demonstrated." },
  { id: "7", name: "Grace Uwimana", score: 84, status: "Shortlisted", date: "2026-03-28", aiReasoning: "Strong backend full-stack capabilities with deep React knowledge. High adaptability for cross-functional teams." },
  { id: "8", name: "Innocent N.", score: 83, status: "Shortlisted", date: "2026-03-25", aiReasoning: "Proven track record in building scalable dashboards and analytics tools. Solid TypeScript skills verified." },
  { id: "9", name: "Solange U.", score: 82, status: "Shortlisted", date: "2026-03-24", aiReasoning: "Excellent attention to detail in UI implementation. Strong understanding of accessibility and responsive design principles." },
  { id: "10", name: "Kevin G.", score: 81, status: "Shortlisted", date: "2026-03-23", aiReasoning: "Good architectural knowledge and experience with state management (Redux, Zustand). Proactive communicator." },
  { id: "11", name: "Fifi M.", score: 80, status: "Shortlisted", date: "2026-03-22", aiReasoning: "Balanced technical and soft skills. Strong potential for lead roles based on previous experience and interview logic." },
  { id: "12", name: "Didier K.", score: 79, status: "Shortlisted", date: "2026-03-21", aiReasoning: "Solid core React skills with a focus on clean, maintainable code. High score for code quality and test coverage." },
  { id: "13", name: "Clarisse U.", score: 78, status: "Shortlisted", date: "2026-03-20", aiReasoning: "Strong background in Agile methodologies and modern CI/CD practices. Reliable technical delivery track record." },
];

const allApplicantsData = [
  ...topCandidatesData,
  { id: "4", name: "Grace Uwimana", score: 78, status: "Reviewing", date: "2026-03-28", aiReasoning: "Strong match for technical requirements but requires deeper review of previous leadership experience." },
  { id: "5", name: "Diane Iradukunda", score: 65, status: "Reviewing", date: "2026-03-29", aiReasoning: "Competent core skills but score was lowered due to lack of experience with large-scale TypeScript projects." },
  { id: "6", name: "John Doe", score: 45, status: "Rejected", date: "2026-03-25", aiReasoning: "Candidate lacks the minimum years of experience required for this senior position (1 vs 5)." },
];

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
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
      <div className="space-y-4">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <Typography variant="small" className="font-semibold">Back to Jobs</Typography>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="space-y-1">
              <Typography variant="h1" className="text-2xl font-semibold tracking-tight text-gray-900 leading-tight">Senior Frontend Engineer</Typography>
              <div className="flex items-center space-x-3">
                 <Typography variant="body" className="text-primary font-semibold text-sm">Umurava</Typography>
                 <span className="h-1 w-1 rounded-full bg-gray-300" />
                 <Typography variant="caption" className="text-gray-600 font-medium text-xs">Remote • Full-time</Typography>
              </div>
           </div>
           <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-xl text-[11px] font-semibold border border-green-100">Active</span>
              <Button className="h-10 shadow-none px-5 font-semibold text-sm transition-none">Edit Job</Button>
           </div>
        </div>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         {/* Top Talent Spotlight */}
         <Card className="lg:col-span-3 p-6 border-primary/10 bg-gradient-to-br from-white to-primary/5">
            <div className="flex items-center justify-between mb-6">
               <div className="space-y-0.5">
                  <Typography variant="h3" className="text-lg font-semibold text-gray-900">Top Shortlisted Talent</Typography>
                  <Typography variant="caption" className="text-gray-600 font-medium text-xs">Highly recommended based on AI screening</Typography>
               </div>
               <Star className="h-5 w-5 text-orange-400 fill-orange-400" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
               {topCandidatesData.slice(0, 10).map((candidate) => (
                  <button 
                    key={candidate.id} 
                    onClick={() => handleOpenModal(candidate)}
                    className="p-3 bg-white border border-gray-100 rounded-2xl flex flex-col items-center text-center space-y-2.5 transition-all group transition-none active:scale-95 shadow-none"
                  >
                     <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-primary/20 transition-all">
                        <Typography variant="h3" className="text-xs font-semibold text-primary">{candidate.score}</Typography>
                     </div>
                     <Typography variant="body" className="text-[11px] font-semibold text-gray-900 truncate w-full">{candidate.name}</Typography>
                     <span className="text-[8px] font-semibold uppercase text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full border border-green-100">
                        Top Match
                     </span>
                  </button>
               ))}
            </div>
         </Card>

         {/* Job Quick Stats */}
         <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Total Applicants", value: "24", icon: Users, color: "blue" },
              { label: "Shortlisted", value: "8", icon: CheckCircle2, color: "green" },
              { label: "Avg AI Score", value: "72%", icon: TrendingUp, color: "orange" }
            ].map((stat, i) => (
              <Card key={i} className="p-4 flex items-center space-x-3">
                 <div className={cn(
                   "h-10 w-10 rounded-xl flex items-center justify-center border",
                   stat.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                   stat.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                   "bg-orange-50 border-orange-100 text-orange-600"
                 )}>
                    <stat.icon className="h-5 w-5" />
                 </div>
                 <div>
                    <Typography variant="h2" className="text-lg font-semibold text-gray-900 leading-tight">{stat.value}</Typography>
                    <Typography variant="caption" className="text-gray-600 font-medium text-[10px] uppercase tracking-wider">{stat.label}</Typography>
                 </div>
              </Card>
            ))}
         </div>
      </div>

      {/* Main Applicants Section */}
      <div className="space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Typography variant="h2" className="text-xl font-semibold text-gray-900">All Applicants</Typography>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
               <div className="relative flex-1 sm:w-80 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="Search candidates..." 
                    className="w-full h-10 bg-white border border-gray-100 rounded-xl pl-11 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans text-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="w-full sm:w-48">
                  <Select 
                    options={statusOptions} 
                    value={selectedStatus} 
                    onChange={setSelectedStatus} 
                    placeholder="Filter Status" 
                  />
               </div>
            </div>
         </div>

         <ApplicantTable applicants={allApplicantsData} />
      </div>

      <ApplicantDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicant={selectedApplicant} 
      />
    </div>
  );
}
