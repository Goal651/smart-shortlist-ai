"use client";

import { useState } from "react";
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
import { ApplicantTable } from "@/components/dashboard/ApplicantTable";
import { Pagination } from "@/components/ui/Pagination";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { cn } from "@/lib/utils";

const allCandidatesData = [
  { 
    id: "1", 
    name: "Alice Mukamana", 
    score: 92, 
    status: "Shortlisted", 
    date: "2026-03-29", 
    source: "Umurava Profile", 
    aiReasoning: { 
      strengths: ["Expert React Lead", "System Design expert", "Senior stakeholder experience"], 
      gaps: ["N/A"], 
      risks: ["Expects higher range salary"], 
      recommendation: "Exceptional candidate. Hire immediately for Lead Frontend." 
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
      strengths: ["UI/UX depth", "Next.js performance architect", "Proven open-source contributor"], 
      gaps: ["Limited Node.js backend experience"], 
      risks: ["N/A"], 
      recommendation: "Strong UI Engineer. Excellent for Next.js focus." 
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
      strengths: ["Solid JS foundation", "Self-starter initiative"],
      gaps: ["Needs more experience with Redux Toolkit"],
      risks: ["N/A"],
      recommendation: "Good mid-level potential. Hire for Frontend Specialist role."
    }
  },
  { 
    id: "4", 
    name: "Grace Uwimana", 
    score: 84, 
    status: "Reviewing", 
    date: "2026-03-28", 
    source: "CSV Upload",
    aiReasoning: {
      strengths: ["Excellent documentation", "Strong accessibility knowledge"],
      gaps: ["No direct experience with Tailwind CSS"],
      risks: ["Limited large-scale project experience"],
      recommendation: "Promising candidate for a growth-oriented team."
    }
  },
  { 
    id: "5", 
    name: "Kevin G.", 
    score: 81, 
    status: "Reviewing", 
    date: "2026-04-03", 
    source: "External PDF",
    aiReasoning: {
      strengths: ["Highly disciplined coder", "Effective unit testing"],
      gaps: ["N/A"],
      risks: ["None identified"],
      recommendation: "Reliable engineer. Move to technical interview."
    }
  },
  { 
    id: "6", 
    name: "Diane Iradukunda", 
    score: 78, 
    status: "Reviewing", 
    date: "2026-03-29", 
    source: "Umurava Profile",
    aiReasoning: {
      strengths: ["Passionate about UI/UX", "Modern React patterns"],
      gaps: ["Junior-level system design knowledge"],
      risks: ["Slow development speed observed in portoflio"],
      recommendation: "Junior/Mid candidate. Good cultural fit."
    }
  },
];

const sourceOptions = [
  { label: "All sourcing channels", value: "all" },
  { label: "Umurava platform", value: "umurava" },
  { label: "External resumes", value: "external" },
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Talent Hub metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-50">
        <div className="space-y-1">
          <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Talent hub</Typography>
          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Centralized database for all screened candidates</Typography>
        </div>
        <div className="flex items-center space-x-3">
           <Button variant="outline" className="h-11 shadow-none px-6 border-gray-100 font-medium text-gray-600 transition-none hover:bg-gray-50">Export global pool</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
            { label: "Total candidates", value: "250+", icon: Users, color: "blue" },
            { label: "High match", value: "42", icon: Star, color: "orange" },
            { label: "Verification rate", value: "94%", icon: ShieldCheck, color: "green" },
            { label: "Average pool score", value: "78.4", icon: TrendingUp, color: "purple" }
         ].map((stat, i) => (
            <Card key={i} className="p-5 flex items-center space-x-4 border-gray-100 shadow-none">
               <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center border transition-all",
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

      {/* Talent search & filter terminal */}
      <div className="space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-none transition-all">
            <div className="relative flex-1 lg:max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
               <input 
                 type="text" 
                 placeholder="Search by name, expertise, or sourcing key..." 
                 className="w-full h-11 bg-gray-50/50 border-transparent rounded-xl pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-work-sans text-gray-900 shadow-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto pr-2">
               <div className="w-full sm:w-64">
                  <Select 
                    options={sourceOptions} 
                    value={selectedSource} 
                    onChange={setSelectedSource} 
                    placeholder="Source segment" 
                  />
               </div>
            </div>
         </div>

         <Card className="border-gray-50 overflow-hidden shadow-none">
            <ApplicantTable 
              applicants={allCandidatesData.filter(c => 
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                c.source.toLowerCase().includes(searchQuery.toLowerCase())
              )} 
              onView={handleOpenModal} 
            />
            <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50">
               <Pagination 
                  currentPage={currentPage} 
                  totalPages={8} 
                  onPageChange={setCurrentPage}
                  className="shadow-none border-0"
               />
            </div>
         </Card>
      </div>

      <ApplicantDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicant={selectedApplicant} 
      />
    </div>
  );
}
