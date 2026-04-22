"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  FileUp,
  History,
  Clock
} from "lucide-react";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { ApplicantDetailsModal } from "@/components/dashboard/ApplicantDetailsModal";
import { useJobs, useAI } from '@/hooks/useApi';
import { useToast } from '@/contexts/ToastContext';
import { AnalysisDetail, RecentAnalysis } from '@/types/request';
import { analysisService } from '@/services/analysis';

export default function UploadPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");
  const [jobSource, setJobSource] = useState<"system" | "custom">("system");
  const [customJDMode, setCustomJDMode] = useState<"paste" | "upload">("paste");
  const [selectedJob, setSelectedJob] = useState("");
  const [customJD, setCustomJD] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [screenedCandidates, setScreenedCandidates] = useState<any[]>([]);
  const [hasScreened, setHasScreened] = useState(false);
  const [hasParsed,setHasParsed] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalysisDetail, setSelectedAnalysisDetail] = useState<AnalysisDetail | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const { jobs } = useJobs();
  const { screenResumes, uploadProgress, isUploading } = useAI();
  const { showToast } = useToast();

  // Convert jobs to options for select
  const systemJobOptions = jobs.map(job => ({
    label: job.title,
    value: job._id
  }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Append new files to existing ones (no duplicates by name)
      const existingNames = new Set(files.map(f => f.name));
      const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
      
      if (uniqueNewFiles.length > 0) {
        setFiles([...files, ...uniqueNewFiles]);
        showToast({
          title: "Files added",
          description: `Added ${uniqueNewFiles.length} file(s). Total: ${files.length + uniqueNewFiles.length}`,
          variant: "success",
          duration: 2000,
        });
      } else {
        showToast({
          title: "Duplicate files",
          description: "These files are already added.",
          variant: "warning",
          duration: 2000,
        });
      }
      
      // Reset input so same file can be added again if removed
      e.target.value = '';
    }
  };

  const handleJDFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setJdFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    const analysisId = searchParams.get('analysisId');
    const tab = searchParams.get('tab');
    
    if (tab === 'history') {
      setActiveTab('history');
    }

    if (analysisId) {
      setActiveTab('history');
      handleOpenAnalysisModal({ _id: analysisId } as any);
    }

    analysisService.getRecentAnalyses()
      .then((response) => {
        if (response.success && response.data) {
          setRecentAnalyses(response.data);
        }
      })
      .catch((error) => {
        console.error('Failed to load recent analyses', error);
      });
  }, [searchParams]);

  const handleRunScreening = async () => {
    if (!selectedJob && !customJD) {
      showToast({
        title: "Missing job details",
        description: "Please select a job or provide a custom job description.",
        variant: "error",
      });
      return;
    }

    if (files.length === 0) {
      showToast({
        title: "No files selected",
        description: "Please upload resume files to screen.",
        variant: "error",
      });
      return;
    }

    try {
      showToast({
        title: "Screening started",
        description: `Processing ${files.length} resumes with Gemini AI...`,
        variant: "info",
        duration: 3000,
      });

      const response = await screenResumes(selectedJob, files);
      
      if (response && response.candidates) {
        setScreenedCandidates(response.candidates);
        setHasScreened(true);

        if (response.analysis) {
          setRecentAnalyses((prev) => {
            const next = [response.analysis, ...prev]
              .filter((item): item is RecentAnalysis => item !== undefined)
              .filter((item, index, self) => self.findIndex((it) => it._id === item._id) === index)
              .slice(0, 5);
            return next;
          });
        }

        showToast({
          title: "Screening complete",
          description: `Successfully analyzed ${response.candidates.length} candidates.`,
          variant: "success",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Screening failed:', error);
      showToast({
        title: "Screening failed",
        description: "Failed to process resumes. Please try again.",
        variant: "error",
      });
    }
  };

  const handleOpenAnalysisModal = async (analysis: RecentAnalysis) => {
    setSelectedAnalysisDetail(null);
    setIsAnalysisModalOpen(true);

    try {
      const response = await analysisService.getAnalysisDetail(analysis._id);
      if (response.success && response.data) {
        setSelectedAnalysisDetail(response.data);
      }
    } catch (error) {
      console.error('Failed to load analysis details', error);
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

      {/* Tab Navigation */}
      {!hasScreened && (
        <div className="flex items-center space-x-1 bg-gray-50 p-1 rounded-xl border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab("upload")}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transition-none",
              activeTab === "upload" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload & Screen</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all transition-none",
              activeTab === "history" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <History className="h-4 w-4" />
            <span>Analysis History</span>
          </button>
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
                                         {candidate.summary 
                                           ? `"${candidate.summary.split('.')[0]}."`
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
      ) : activeTab === "upload" ? (
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
                 <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                       <Typography variant="body" className="font-medium text-xs text-gray-600 tracking-widest">Selected Files ({files.length})</Typography>
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

                    <div className="pt-4 flex items-center gap-3">
                       <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100 text-[10px]">
                          <CheckCircle2 className="h-3 w-3" />
                          <Typography variant="caption" className="font-medium leading-tight">Ready to screen</Typography>
                       </div>
                       <Button 
                         onClick={handleRunScreening}
                         disabled={isUploading}
                         className="h-10 px-6 shadow-none font-medium transition-none gap-2 ml-auto"
                       >
                          {isUploading ? (
                             <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Screening...
                             </>
                          ) : (
                             <>
                                <Sparkles className="h-4 w-4" />
                                Analyze with Gemini
                             </>
                          )}
                       </Button>
                    </div>
                 </div>
              )}

            </Card>
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
      ) : (
        /* History Tab */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900 leading-tight">Analysis History</Typography>
              <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">View your recent screening analyses and results</Typography>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <Clock className="h-4 w-4" />
              <Typography variant="caption" className="font-medium">{recentAnalyses.length} analyses</Typography>
            </div>
          </div>

          {recentAnalyses.length === 0 ? (
            <Card className="p-12 text-center border-gray-100 shadow-none">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <Typography variant="h2" className="text-lg font-medium text-gray-900 mb-2">No Analysis History</Typography>
              <Typography variant="body" className="text-gray-600 mb-6">You haven't performed any screenings yet. Switch to the Upload tab to get started.</Typography>
              <Button onClick={() => setActiveTab("upload")} className="shadow-none">
                <UploadCloud className="h-4 w-4 mr-2" />
                Start Screening
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-gray-100 shadow-none">
                <div className="p-6 border-b border-gray-50">
                  <Typography variant="h2" className="text-lg font-medium text-gray-900">Analysis History</Typography>
                  <Typography variant="caption" className="text-gray-600 mt-1">Click on any analysis to view detailed results</Typography>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Job Title</th>
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Files</th>
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Candidates</th>
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Top Score</th>
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Date</th>
                        <th className="px-6 py-4 text-left text-[10px] font-medium text-gray-600 tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {recentAnalyses.map((analysis) => (
                        <tr key={analysis._id} className="group hover:bg-gray-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <Typography variant="body" className="text-sm font-medium text-gray-900 truncate max-w-xs">{analysis.jobTitle}</Typography>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                              {analysis.fileCount} file{analysis.fileCount === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                              {analysis.candidateCount} candidate{analysis.candidateCount === 1 ? '' : 's'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-100">
                              {analysis.topScore}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Typography variant="caption" className="text-xs text-gray-600">
                              {new Date(analysis.createdAt).toLocaleDateString()} <br />
                              <span className="text-[10px] text-gray-500">{new Date(analysis.createdAt).toLocaleTimeString()}</span>
                            </Typography>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleOpenAnalysisModal(analysis)}
                              className="h-8 w-8 rounded-lg border border-gray-100 bg-white flex items-center justify-center text-gray-600 hover:text-primary hover:border-primary/20 transition-all shadow-none"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {recentAnalyses.length === 0 && (
                  <div className="p-12 text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-lg font-medium text-gray-900 mb-2">No Analysis History</Typography>
                    <Typography variant="body" className="text-gray-600">You haven't performed any screenings yet.</Typography>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Analysis Details Modal */}
      <Modal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} title="Analysis Details" className="max-w-4xl">
        {selectedAnalysisDetail ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h2" className="text-xl font-medium text-gray-900 mb-1">{selectedAnalysisDetail.jobTitle}</Typography>
                  <Typography variant="caption" className="text-gray-600">
                    Analyzed on {new Date(selectedAnalysisDetail.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {new Date(selectedAnalysisDetail.createdAt).toLocaleTimeString()}
                  </Typography>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-5 w-5 text-orange-400 fill-orange-400" />
                    <Typography variant="h1" className="text-2xl font-medium text-gray-900">{selectedAnalysisDetail.topScore}</Typography>
                  </div>
                  <Typography variant="caption" className="text-xs text-gray-600">Highest Match Score</Typography>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-5 bg-blue-50/10 border-blue-100/50 shadow-none">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Typography variant="h1" className="text-2xl font-medium text-gray-900">{selectedAnalysisDetail.fileCount}</Typography>
                    <Typography variant="caption" className="text-xs text-gray-600">Files Processed</Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-green-50/10 border-green-100/50 shadow-none">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Typography variant="h1" className="text-2xl font-medium text-gray-900">{selectedAnalysisDetail.candidateCount}</Typography>
                    <Typography variant="caption" className="text-xs text-gray-600">Candidates Analyzed</Typography>
                  </div>
                </div>
              </Card>

              <Card className="p-5 bg-purple-50/10 border-purple-100/50 shadow-none">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <Typography variant="h1" className="text-2xl font-medium text-gray-900">
                      {selectedAnalysisDetail.candidateCount > 0 ? Math.round((selectedAnalysisDetail.candidateCount / selectedAnalysisDetail.fileCount) * 100) / 100 : 0}
                    </Typography>
                    <Typography variant="caption" className="text-xs text-gray-600">Avg Candidates/File</Typography>
                  </div>
                </div>
              </Card>
            </div>

            {/* Top People List */}
            <Card className="p-6 bg-white border border-gray-100 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="h3" className="text-base font-medium text-gray-900">Top Candidates from this Analysis</Typography>
                  <Typography variant="caption" className="text-gray-500">Review the highest scored profiles included in this batch.</Typography>
                </div>
              </div>
              <div className="space-y-3">
                {selectedAnalysisDetail.topCandidates.length > 0 ? (
                  selectedAnalysisDetail.topCandidates.map((candidate, index) => (
                    <div key={candidate._id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-3xl border border-gray-100 bg-gray-50">
                      <div className="min-w-0">
                        <Typography variant="body" className="text-sm font-semibold text-gray-900 truncate">{candidate.name}</Typography>
                        <Typography variant="caption" className="text-[10px] text-gray-600">{candidate.email || candidate.linkedin || 'Candidate profile'}</Typography>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">Score {candidate.score}</span>
                        <Typography variant="caption" className="text-[10px] text-gray-600">{candidate.summary ? `${candidate.summary.slice(0, 50)}...` : 'No summary available'}</Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <Typography variant="body" className="text-sm text-gray-600">No top candidate details are available for this analysis.</Typography>
                )}
              </div>
            </Card>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <Button variant="outline" onClick={() => setIsAnalysisModalOpen(false)} className="border-gray-100 shadow-none">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Typography variant="body" className="text-sm text-gray-600">Loading analysis details...</Typography>
          </div>
        )}
      </Modal>

      {/* Shared Detail Modal */}
      <ApplicantDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        applicant={selectedApplicant} 
      />
    </div>
  );
}
