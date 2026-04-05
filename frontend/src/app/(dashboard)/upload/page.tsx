"use client";

import { useState } from "react";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Info, 
  AlertCircle, 
  Trash2, 
  Search, 
  Briefcase, 
  FileSearch, 
  TrendingUp, 
  Star,
  ArrowRight,
  UserCheck,
  ChevronRight,
  ListFilter,
  Type,
  FileUp
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { useJobs, useAI } from '@/hooks/useApi';

const mockSystemJobs = [
  { label: "Senior Frontend Engineer", value: "job-1" },
  { label: "Backend Developer", value: "job-2" },
  { label: "UI/UX Designer", value: "job-3" },
];

const mockRankedCandidates = [
  { 
    id: "1", 
    name: "Jean Paul Niyonzima", 
    email: "jp.n@example.com", 
    score: 94, 
    status: "Shortlisted",
    date: "2026-04-03",
    source: "External PDF",
    skills: ["React", "TypeScript", "Next.js", "Node.js"],
    aiReasoning: {
      strengths: ["Exceptional architecture knowledge", "Strong leadership experience", "Next.js performance specialist"],
      gaps: ["No direct experience with the specific styling library (Tailwind)"],
      risks: ["Higher-than-average salary history"],
      recommendation: "Top-tier candidate. Move to final interview immediately."
    }
  },
  { 
    id: "2", 
    name: "Sarah Uwimana", 
    email: "s.uwi@example.com", 
    score: 88, 
    status: "Shortlisted",
    date: "2026-04-03",
    source: "LinkedIn CSV",
    skills: ["Next.js", "Tailwind CSS", "Figma", "Redux"],
    aiReasoning: {
      strengths: ["Solid design implementation skills", "Proficient in modern state management"],
      gaps: ["Limited backend/API architecture knowledge"],
      risks: ["None identified"],
      recommendation: "Excellent fit for UI Engineering and Design System roles."
    }
  },
  { 
    id: "3", 
    name: "Kevin Gakwaya", 
    email: "k.gak@example.com", 
    score: 72, 
    status: "Reviewing",
    date: "2026-04-03",
    source: "External PDF",
    skills: ["Python", "Django", "PostgreSQL", "React"],
    aiReasoning: {
      strengths: ["Strong backend capabilities", "Full-stack mindset"],
      gaps: ["Lacks lead experience for a Senior Frontend role"],
      risks: ["Primarily a Python developer, might take longer to onboard on TS/React patterns"],
      recommendation: "Potential fit for Full-Stack positions, but moderate risk for pure Frontend Lead."
    }
  },
];

export default function UploadPage() {
  const [jobSource, setJobSource] = useState<"system" | "custom">("system");
  const [customJDMode, setCustomJDMode] = useState<"paste" | "upload">("paste");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJD, setCustomJD] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [hasScreened, setHasScreened] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [screenedCandidates, setScreenedCandidates] = useState<any[]>([]);
  
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { jobs } = useJobs();
  const { screenResumes, uploadProgress, isUploading } = useAI();

  // Convert jobs to options for select
  const systemJobOptions = jobs.map(job => ({
    label: job.title,
    value: job._id
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setIsParsing(true);
      setTimeout(() => {
        setIsParsing(false);
        setHasParsed(true);
      }, 2000);
    }
  };

  const handleJDFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  const handleRunScreening = async () => {
    if (!selectedJob && !customJD) {
      alert('Please select a job or provide custom job description');
      return;
    }

    if (files.length === 0) {
      alert('Please upload resume files');
      return;
    }

    setIsScreening(true);
    try {
      // Use the selected system job
      const response = await screenResumes(selectedJob, files);
      setHasScreened(true);
      
      // Store the real screened candidates
      if (response && response.candidates) {
        setScreenedCandidates(response.candidates);
      }
    } catch (error) {
      console.error('Screening failed:', error);
      alert('Screening failed. Please try again.');
    } finally {
      setIsScreening(false);
    }
  };

  const handleOpenModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      {!hasScreened && (
        <div className="space-y-1">
          <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Scenario 2: Bulk External Screening</Typography>
          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Screen candidates from LinkedIn, Resumes, or CSVs with full Gemini transparency</Typography>
        </div>
      )}

      {hasScreened ? (
        /* Result Dashboard Section */
        <div className="space-y-8 animate-in slide-in-from-top-6 duration-700">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-gray-50">
             <div className="space-y-1">
                <Typography variant="h1" className="text-2xl font-medium text-gray-900 tracking-tight">External Screening Results</Typography>
                <div className="flex items-center space-x-2">
                   <CheckCircle2 className="h-4 w-4 text-green-500" />
                   <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">Successfully ranked {screenedCandidates.length} external candidates</Typography>
                </div>
             </div>
             <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setHasScreened(false);
                    setHasParsed(false);
                    setFiles([]);
                    setJdFile(null);
                    setCustomJD("");
                  }}
                  className="h-10 shadow-none px-6 border-gray-100 font-medium text-gray-600 hover:bg-gray-50 transition-none"
                >
                  New Batch Upload
                </Button>
                <Button className="h-10 shadow-none px-6 font-medium transition-none">Export Ranking Report</Button>
             </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                 { label: "Avg Match Score", value: "84%", icon: TrendingUp, color: "blue" },
                 { label: "Top Matches", value: "2", icon: Star, color: "orange" },
                 { label: "Sourcing Channel", value: "Multi", icon: FileSearch, color: "green" },
                 { label: "Pool Quality", value: "High", icon: UserCheck, color: "purple" }
              ].map((stat, i) => (
                 <Card key={i} className="p-5 flex items-center space-x-4 border-gray-100 shadow-none">
                    <div className={cn(
                       "h-10 w-10 rounded-xl flex items-center justify-center border",
                       stat.color === 'blue' ? "bg-blue-50 border-blue-100 text-blue-600" :
                       stat.color === 'orange' ? "bg-orange-50 border-orange-100 text-orange-600" :
                       stat.color === 'green' ? "bg-green-50 border-green-100 text-green-600" :
                       "bg-purple-50 border-purple-100 text-purple-600"
                    )}>
                       <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                       <Typography variant="h2" className="text-lg font-medium text-gray-900 leading-none">{stat.value}</Typography>
                       <Typography variant="caption" className="text-[10px] text-gray-600 font-medium tracking-wider pt-1 block">{stat.label}</Typography>
                    </div>
                 </Card>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                       <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                       <Typography variant="h2" className="text-lg font-medium text-gray-900">Top Ranked Match Grid</Typography>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {screenedCandidates.slice(0, 3).map((candidate, index) => (
                      <button 
                        key={candidate._id || index} 
                        onClick={() => handleOpenModal(candidate)}
                        className="p-5 bg-white border border-gray-100 rounded-2xl flex flex-col items-center text-center space-y-3 transition-all hover:border-primary/20 active:scale-95 group transition-none shadow-none"
                      >
                         <div className="h-10 w-10 text-xs font-medium text-primary bg-primary/5 rounded-xl flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-all">
                            {candidate.score || 'N/A'}
                         </div>
                         <div className="space-y-0.5">
                            <Typography variant="body" className="text-xs font-medium text-gray-900 truncate w-32">{candidate.name}</Typography>
                            <Typography variant="caption" className="text-[10px] text-gray-600 tracking-widest font-medium">Top Match</Typography>
                         </div>
                         <ChevronRight className="h-3 w-3 text-gray-300 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                    <div className="p-5 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 opacity-50 grayscale">
                       <Typography variant="body" className="text-[10px] font-medium text-gray-600">External Candidates</Typography>
                       <Typography variant="caption" className="text-[9px] font-medium text-gray-600">Total Pooled: {screenedCandidates.length}</Typography>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                       <ListFilter className="h-4 w-4 text-gray-600" />
                       <Typography variant="h2" className="text-lg font-medium text-gray-900">Ranked Results (Full Table)</Typography>
                    </div>
                    <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-none">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest">Candidate</th>
                                <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest text-center">AI Score</th>
                                <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest">Why Chosen (Verdict)</th>
                                <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest text-right">Action</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {screenedCandidates.map((candidate, index) => (
                                <tr key={candidate._id || index} className="group hover:bg-gray-50/30 transition-colors">
                                   <td className="px-5 py-4">
                                      <div className="space-y-0.5">
                                         <Typography variant="body" className="text-xs font-medium text-gray-900">{candidate.name}</Typography>
                                         <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">{candidate.email || 'No email'}</Typography>
                                      </div>
                                   </td>
                                   <td className="px-5 py-4 text-center">
                                      <span className={cn(
                                         "inline-flex items-center justify-center p-1.5 h-8 w-12 rounded-lg text-xs font-medium",
                                         candidate.score >= 90 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                                      )}>
                                         {candidate.score || 'N/A'}
                                      </span>
                                   </td>
                                   <td className="px-5 py-4">
                                      <Typography variant="body" className="text-[11px] text-gray-600 leading-normal italic line-clamp-1 max-w-[280px]">
                                         {candidate.aiReasoning?.recommendation 
                                           ? `"${candidate.aiReasoning.recommendation.split('.')[0]}."`
                                           : "AI analysis not available"
                                         }
                                      </Typography>
                                   </td>
                                   <td className="px-5 py-4 text-right">
                                      <button 
                                        onClick={() => handleOpenModal(candidate)}
                                        className="h-8 w-8 rounded-lg border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary/20 transition-all transition-none shadow-none"
                                      >
                                         <ArrowRight className="h-4 w-4" />
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <Card className="p-6 bg-primary/3 border-primary/20 space-y-5 shadow-none animate-in fade-in duration-1000">
                    <div className="flex items-center space-x-2 text-primary">
                       <Sparkles className="h-5 w-5 fill-primary/10" />
                       <Typography variant="h3" className="text-sm font-medium tracking-widest">Gemini Executive Verdict</Typography>
                    </div>
                    <Typography variant="body" className="text-[13px] text-gray-700 leading-relaxed font-medium italic">
                       "Of the {screenedCandidates.length} external candidates pooled, {screenedCandidates.filter(c => (c.score || 0) > 85).length} demonstrated exceptional compatibility (&gt;85% matching) with the job requirements. We recommend moving instantly to technical verification for the top rank."
                    </Typography>
                    <div className="space-y-3 pt-2">
                       <div className="space-y-1">
                          <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">Key Filtering Criteria</Typography>
                          <div className="flex flex-wrap gap-2">
                             {["Cloud Architecture", "Lead Patterns", "React Mastery"].map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-white border border-gray-100 text-[9px] font-medium text-gray-600 rounded-lg">{tag}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </Card>

                 <Card className="p-6 border-gray-100 space-y-4 shadow-none">
                    <Typography variant="body" className="font-medium text-xs text-gray-900">Pool Insights</Typography>
                    <div className="space-y-4">
                       {[
                          { label: "Extraction Accuracy", value: "98.4%" },
                          { label: "Sourcing Diversity", value: "3 Channels" },
                          { label: "Screening Latency", value: "2.4s" }
                       ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                             <Typography variant="body" className="text-xs text-gray-600 font-medium">{item.label}</Typography>
                             <Typography variant="body" className="text-xs font-medium text-gray-900">{item.value}</Typography>
                          </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        </div>
      ) : (
        /* ORIGINAL UPLOAD content with CUSTOM JD refinements */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Job Context */}
            <Card className="p-6 space-y-6 border-gray-100 shadow-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-900">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <Typography variant="body" className="font-medium text-sm tracking-wider">Step 1: Define Job Context</Typography>
                </div>
                <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100">
                  <button 
                    onClick={() => setJobSource("system")}
                    className={cn(
                      "px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all transition-none",
                      jobSource === "system" ? "bg-white text-primary" : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    System Job
                  </button>
                  <button 
                     onClick={() => setJobSource("custom")}
                     className={cn(
                       "px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all transition-none",
                       jobSource === "custom" ? "bg-white text-primary" : "text-gray-600 hover:text-gray-900"
                     )}
                  >
                    Custom JD
                  </button>
                </div>
              </div>

              {jobSource === "system" ? (
                 <div className="space-y-1.5 animate-in fade-in duration-300">
                    <Typography variant="caption" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Select Existing Job</Typography>
                    <Select 
                      options={systemJobOptions} 
                      value={selectedJob} 
                      onChange={setSelectedJob} 
                      placeholder="Choose a job from your platform..." 
                    />
                 </div>
              ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="flex items-center space-x-3 pb-1 border-b border-gray-50">
                          <button 
                            onClick={() => setCustomJDMode("paste")}
                            className={cn(
                                "flex items-center space-x-2 text-[10px] font-medium  tracking-widest px-3 py-2 rounded-lg transition-all transition-none",
                                customJDMode === 'paste' ? "bg-primary/5 text-primary" : "text-gray-600 hover:text-gray-900"
                            )}
                          >
                             <Type className="h-3 w-3" />
                             <span>Paste Text</span>
                          </button>
                          <button 
                             onClick={() => setCustomJDMode("upload")}
                             className={cn(
                                "flex items-center space-x-2 text-[10px] font-medium  tracking-widest px-3 py-2 rounded-lg transition-all transition-none",
                                customJDMode === 'upload' ? "bg-primary/5 text-primary" : "text-gray-600 hover:text-gray-900"
                             )}
                          >
                             <FileUp className="h-3 w-3" />
                             <span>Upload Job File</span>
                          </button>
                      </div>

                      {customJDMode === "paste" ? (
                         <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                            <Typography variant="caption" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Paste Job Description</Typography>
                            <textarea 
                                className="w-full min-h-[150px] rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans text-gray-900 resize-none shadow-none"
                                placeholder="Paste the full job description here..."
                                value={customJD}
                                onChange={(e) => setCustomJD(e.target.value)}
                            />
                         </div>
                      ) : (
                         <div className="relative group animate-in slide-in-from-top-2 duration-300">
                            <input 
                                type="file" 
                                onChange={handleJDFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={cn(
                                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300",
                                jdFile ? "border-primary/20 bg-primary/2" : "border-gray-100 bg-gray-50/50 group-hover:border-primary/20 group-hover:bg-primary/5"
                            )}>
                               <FileUp className={cn("h-6 w-6 mb-2", jdFile ? "text-primary" : "text-gray-600")} />
                               <Typography variant="body" className="text-xs font-medium text-gray-900">
                                  {jdFile ? jdFile.name : "Upload JD Document (PDF, Docx)"}
                               </Typography>
                               {!jdFile && <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">Click or drag relevant job file here</Typography>}
                            </div>
                         </div>
                      )}
                  </div>
              )}
            </Card>

            {/* Step 2: File Upload */}
            <Card className="p-6 space-y-6 border-gray-100 shadow-none">
              <div className="flex items-center space-x-2 text-gray-900">
                <UploadCloud className="h-4 w-4 text-primary" />
                <Typography variant="body" className="font-medium text-sm tracking-wider">Step 2: Upload External Data</Typography>
              </div>

              <div className="relative group">
                 <input 
                   type="file" 
                   multiple 
                   onChange={handleFileUpload}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 />
                 <div className={cn(
                    "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all duration-300",
                    files.length > 0 ? "border-green-100 bg-green-50/10" : "border-gray-100 bg-gray-50/50 group-hover:border-primary/20 group-hover:bg-primary/5"
                 )}>
                    <div className="h-14 w-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-600 group-hover:text-primary transition-colors">
                       <UploadCloud className="h-7 w-7" />
                    </div>
                    <div className="mt-4 space-y-1">
                       <Typography variant="body" className="font-medium text-gray-900">
                          {files.length > 0 ? `${files.length} Files Selected` : "Drag & drop candidate files"}
                       </Typography>
                       <Typography variant="caption" className="text-gray-600 font-medium">Supports PDF, CSV, Excel (Max 50MB)</Typography>
                    </div>
                 </div>
              </div>

              {files.length > 0 && (
                 <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                       <Typography variant="body" className="font-medium text-xs text-gray-600 tracking-widest">Selected Files</Typography>
                       <button onClick={() => setFiles([])} className="text-[10px] font-medium text-gray-600 hover:text-red-500 tracking-widest transition-none shadow-none">Clear All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl">
                             <div className="flex items-center space-x-3 truncate">
                                <FileText className="h-4 w-4 text-primary" />
                                <Typography variant="body" className="text-[11px] font-medium text-gray-700 truncate">{file.name}</Typography>
                             </div>
                             <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-500 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                             </button>
                          </div>
                       ))}
                    </div>
                 </div>
              )}
            </Card>

            {/* Step 3: Parsing Preview Section */}
            {(isParsing || hasParsed) && (
               <Card className="p-6 space-y-6 border-gray-100 shadow-none animate-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-2 text-gray-900">
                        <FileSearch className="h-4 w-4 text-primary" />
                        <Typography variant="body" className="font-medium text-sm tracking-wider">Step 3: Verification Preview</Typography>
                     </div>
                     {isParsing && (
                        <div className="flex items-center space-x-2 text-primary">
                           <Loader2 className="h-3.5 w-3.5 animate-spin" />
                           <Typography variant="caption" className="text-[10px] font-medium tracking-widest">Parsing Profiles...</Typography>
                        </div>
                     )}
                  </div>

                  <div className="w-full bg-white rounded-xl border border-gray-100 overflow-hidden shadow-none">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-gray-50/50 border-b border-gray-50">
                              <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest">Candidate</th>
                              <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest">Extracted Skills</th>
                              <th className="px-5 py-3 text-[10px] font-medium text-gray-600 tracking-widest text-right">Verification</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {isParsing ? (
                              Array.from({ length: 2 }).map((_, i) => (
                                 <tr key={i} className="animate-pulse">
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-50 rounded-lg w-32" /></td>
                                    <td className="px-5 py-4"><div className="h-4 bg-gray-50 rounded-lg w-48" /></td>
                                    <td className="px-5 py-4 text-right"><div className="h-4 bg-gray-50 rounded-lg w-12 ml-auto" /></td>
                                  </tr>
                              ))
                           ) : (
                              screenedCandidates.map((candidate, index) => (
                                 <tr key={candidate._id || index} className="group hover:bg-gray-50/30 transition-colors">
                                    <td className="px-5 py-4">
                                       <div className="space-y-0.5">
                                          <Typography variant="body" className="text-xs font-medium text-gray-900">{candidate.name}</Typography>
                                          <Typography variant="caption" className="text-[10px] text-gray-600 font-medium">{candidate.email || 'No email'}</Typography>
                                       </div>
                                    </td>
                                    <td className="px-5 py-4">
                                       <div className="flex flex-wrap gap-1.5">
                                          {candidate.skills && candidate.skills.length > 0 
                                            ? candidate.skills.slice(0, 3).map((skill: string, skillIndex: number) => (
                                               <span key={skillIndex} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[9px] font-medium text-gray-600 rounded-lg">{skill}</span>
                                            ))
                                            : <span className="text-[10px] text-gray-500">No skills extracted</span>
                                          }
                                       </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                       <div className="inline-flex items-center space-x-1.5 text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 font-medium text-[9px] tracking-wider">
                                          <CheckCircle2 className="h-2.5 w-2.5" />
                                          <span>Verified</span>
                                       </div>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>

                  {!isParsing && (
                     <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                           <AlertCircle className="h-3 w-3" />
                           <Typography variant="caption" className="text-[10px] font-medium leading-tight">Ready to screen {files.length} profiles based on {jobSource === 'system' ? 'the selected system job' : jdFile ? 'the uploaded JD file' : 'your custom text'}.</Typography>
                        </div>
                        <Button 
                          onClick={handleRunScreening}
                          disabled={isScreening || isUploading || hasScreened}
                          className={cn(
                            "w-full sm:w-auto h-11 px-8 shadow-none font-medium transition-none gap-2"
                          )}
                        >
                           {(isScreening || isUploading) ? (
                              <>
                                 <Loader2 className="h-4 w-4 animate-spin" />
                                 {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'AI Screening...'}
                              </>
                           ) : (
                              <>
                                 <Sparkles className="h-4 w-4" />
                                 Screen with Gemini
                              </>
                           )}
                        </Button>
                     </div>
                  )}
               </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <Card className="p-6 bg-primary/3 border-primary/20 space-y-4 shadow-none">
                <div className="flex items-center space-x-2 text-primary">
                   <Sparkles className="h-4 w-4" />
                   <Typography variant="body" className="font-medium text-xs tracking-widest leading-none">External Analysis</Typography>
                </div>
                <Typography variant="body" className="text-xs text-gray-700 leading-relaxed font-medium">
                   Screen external talent pools against any requirement. Gemini extracts core competencies from your JD source and ranks candidates with full transparency.
                </Typography>
             </Card>

             <Card className="p-6 space-y-4 shadow-none border-gray-100">
                <Typography variant="body" className="font-medium text-xs text-gray-900">System Stats</Typography>
                <div className="space-y-3">
                   {[
                      { label: "Active Jobs", value: "12" },
                      { label: "Pool Size", value: "250+" },
                      { label: "Extracted Skills", value: "1k+" }
                   ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                         <Typography variant="caption" className="text-gray-600 font-medium">{item.label}</Typography>
                         <Typography variant="body" className="text-xs font-medium text-gray-900">{item.value}</Typography>
                      </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>
      )}

      {/* Shared Detail Modal */}
      <ApplicantDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicant={selectedApplicant} 
      />
    </div>
  );
}
