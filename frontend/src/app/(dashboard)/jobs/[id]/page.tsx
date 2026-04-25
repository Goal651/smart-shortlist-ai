"use client"
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, DollarSign, Briefcase, GraduationCap,
  Users, PlayCircle, Mail, Phone, Calendar, Eye, X, Trash2, Edit
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/client";
import { useToast } from "@/contexts/ToastContext";
import { CreateJobModal } from "@/components/dashboard/CreateJobModal";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  requirements: { skills: string[]; minExperience: number; education: string };
  salaryRange?: { min?: number; max?: number; currency: string };
  isActive: boolean;
  createdAt: string;
}

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  status: "Applied" | "Screening" | "Shortlisted" | "Rejected";
  submittedAt: string;
  score?: number;
  summary?: string;
  topSkills?: string[];
  gaps?: string[];
}

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-700 border-blue-100",
  Screening: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Shortlisted: "bg-green-50 text-green-700 border-green-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
};

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingJob, setLoadingJob] = useState(true);
  const [loadingApps, setLoadingApps] = useState(true);
  const [jobError, setJobError] = useState(false);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [isScreeningAll, setIsScreeningAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [showcaseCount, setShowcaseCount] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Edit Job Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getToken = () => localStorage.getItem("auth_token");

  const fetchJob = useCallback(async () => {
    try {
      setJobError(false);
      const res = await apiClient.get<Job>(`/jobs/${id}`);
      if (res.success && res.data) {
        setJob(res.data);
      } else {
        setJobError(true);
      }
    } catch {
      setJobError(true);
    } finally {
      setLoadingJob(false);
    }
  }, [id]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoadingApps(true);
      const res = await apiClient.get<{ applications: Application[] }>(`/applications`, { jobId: id, limit: 500 });
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
      }
    } catch {
    } finally {
      setLoadingApps(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
    fetchApplications();
  }, [fetchJob, fetchApplications]);

  useEffect(() => {
    if (selectedApp) {
      const updated = applications.find((a) => a._id === selectedApp._id);
      if (updated) setSelectedApp(updated);
    }
  }, [applications]); // eslint-disable-line react-hooks/exhaustive-deps

  const { showToast } = useToast();

  const handleScreenAll = async () => {
    setIsScreeningAll(true);
    try {
      const res = await apiClient.post<{ analysisId: string }>(`/applications/jobs/${id}/screen-all`);
      if (res.success && res.data) {
        showToast({
          title: "Screening Started",
          description: "AI is analyzing the applications. Redirecting you to the history...",
          variant: "success"
        });
        // Redirect to analysis history with the new analysis opened
        router.push(`/upload?tab=history&analysisId=${res.data.analysisId}`);
      } else {
        showToast({
          title: "Screening Failed",
          description: res.message || "Failed to screen applications",
          variant: "error"
        });
      }
    } catch (err: any) {
      showToast({
        title: "Error",
        description: err.response?.data?.error || "Failed to screen applications. Please try again later.",
        variant: "error"
      });
      console.log(err.response?.data?.error || "Failed to screen applications")
    } finally {
      setIsScreeningAll(false);
    }
  };


  const handleDeleteJob = async () => {
    if (!confirm("Are you sure you want to delete this job? This will also delete all applications and candidates.")) return;
    setIsDeleting(true);
    try {
      const res = await apiClient.delete(`/jobs/${id}`);
      if (res.success) {
        router.push("/jobs");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScreen = async (appId: string) => {
    setScreeningId(appId);
    try {
      const res = await apiClient.post(`/applications/${appId}/screen`);
      if (res.success) await fetchApplications();
    } finally {
      setScreeningId(null);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const fmtSalary = (s?: Job["salaryRange"]) => {
    if (!s) return "Competitive";
    if (s.min && s.max)
      return `${s.currency} ${s.min.toLocaleString()} - ${s.max.toLocaleString()}`;
    return s.min ? `${s.currency} ${s.min.toLocaleString()}+` : "Competitive";
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...applications];
    
    // Filter by status if selected
    if (statusFilter) {
      list = list.filter(a => a.status === statusFilter);
    }

    // Sort by score (descending) if we are showcasing top candidates
    if (showcaseCount !== "all") {
      list = list.sort((a, b) => (b.score || 0) - (a.score || 0));
      const count = parseInt(showcaseCount);
      list = list.slice(0, count);
    }

    return list;
  }, [applications, statusFilter, showcaseCount]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filteredAndSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const stats = {
    total: applications.length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    screening: applications.filter((a) => a.status === "Screening").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  if (loadingJob)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );

  if (jobError || !job)
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">
          {jobError ? "Failed to load job. Please try again." : "Job not found."}
        </p>
        <Button onClick={() => router.push("/jobs")} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="flex items-center gap-2 text-gray-600 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="gap-2">
            <Edit className="h-4 w-4" /> Edit Job
          </Button>
          <Button variant="outline" onClick={handleDeleteJob} disabled={isDeleting} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-4 w-4" /> {isDeleting ? "Deleting..." : "Delete Job"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <Typography variant="h1" className="text-3xl font-bold text-gray-900">
            {job.title}
          </Typography>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {job.type}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
              <DollarSign className="h-3.5 w-3.5" />
              {fmtSalary(job.salaryRange)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <Typography variant="small" className="text-gray-500">
            Posted {fmt(job.createdAt)}
          </Typography>
          <div className="mt-2">
            <span
              className={cn(
                "text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border",
                job.isActive
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              )}
            >
              {job.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards at the top */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applicants", value: stats.total, color: "text-gray-900", icon: Users },
          { label: "Shortlisted", value: stats.shortlisted, color: "text-green-600", icon: Eye },
          { label: "In Screening", value: stats.screening, color: "text-yellow-600", icon: PlayCircle },
          { label: "Rejected", value: stats.rejected, color: "text-red-600", icon: X },
        ].map((s) => (
          <Card key={s.label} className="p-5 border-gray-100 shadow-none flex flex-col items-center text-center space-y-2">
            <div className={cn("p-2 rounded-full bg-gray-50", s.color.replace('text-', 'bg-').replace('600', '100'))}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Full Width Description - Clean Borderless Look */}
      <div className="p-0 space-y-8">
        <div>
          <Typography variant="h2" className="text-xl font-bold text-gray-900 mb-4 pb-2">
            Job Description
          </Typography>
          <p className="text-gray-600 whitespace-pre-wrap leading-relaxed max-w-5xl text-base">
            {job.description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 pt-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Experience</p>
                <p className="text-sm text-gray-500 font-medium">
                  {job.requirements.minExperience > 0
                    ? `${job.requirements.minExperience}+ years`
                    : "No minimum required"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Education</p>
                <p className="text-sm text-gray-500 font-medium">
                  {job.requirements.education || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {job.requirements.skills.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Core Competencies</p>
              <div className="flex flex-wrap gap-2">
                {job.requirements.skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-4 py-1.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Width Applicants Section */}
      <div className="space-y-6 pt-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <p className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" /> 
            Applicants Management
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-bold whitespace-nowrap">Showcase:</span>
              <div className="w-48">
                <Select
                  options={[
                    { label: "All Candidates", value: "all" },
                    { label: "Top 5", value: "5" },
                    { label: "Top 10", value: "10" },
                    { label: "Top 15", value: "15" },
                    { label: "Top 20", value: "20" },
                  ]}
                  value={showcaseCount}
                  onChange={setShowcaseCount}
                  className="h-10 text-sm font-medium"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-bold whitespace-nowrap">Status:</span>
              <div className="w-48">
                <Select
                  options={[
                    { label: "Any Status", value: "" },
                    { label: "Applied", value: "Applied" },
                    { label: "Screening", value: "Screening" },
                    { label: "Shortlisted", value: "Shortlisted" },
                    { label: "Rejected", value: "Rejected" },
                  ]}
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                  className="h-10 text-sm font-medium"
                />
              </div>
            </div>
            <Button 
              onClick={handleScreenAll} 
              disabled={isScreeningAll || stats.total === 0}
              className="h-10 px-6 gap-2 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/20"
            >
              {isScreeningAll ? (
                <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <PlayCircle className="h-4 w-4" />
              )}
              Screen All Candidates
            </Button>
          </div>
        </div>

        {loadingApps ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : paged.length === 0 ? (
          <Card className="p-20 text-center border-gray-100 shadow-none bg-gray-50/20">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <Typography variant="h3" className="text-gray-900 font-medium mb-1">No candidates match your criteria</Typography>
            <p className="text-sm text-gray-500">Try adjusting your filters or showcasing more candidates.</p>
          </Card>
        ) : (
          <Card className="border-none shadow-none overflow-hidden bg-transparent">
            <div className="divide-y divide-gray-100">
              {paged.map((app) => (
                <div
                  key={app._id}
                  className="p-6 flex items-start justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <p className="text-lg font-bold text-gray-900">
                        {app.firstName} {app.lastName}
                      </p>
                      <span
                        className={cn(
                          "text-xs px-3 py-1 rounded-full border font-bold uppercase tracking-tight",
                          statusColors[app.status] ||
                          "bg-gray-50 text-gray-600 border-gray-100"
                        )}
                      >
                        {app.status}
                      </span>
                      {app.score != null && (
                        <span
                          className={cn(
                            "text-xs px-3 py-1 rounded-full border font-bold shadow-sm",
                            app.score >= 80
                              ? "bg-green-100 text-green-800 border-green-200"
                              : app.score >= 60
                                ? "bg-orange-100 text-orange-800 border-orange-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          )}
                        >
                          Match: {app.score}%
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {app.email}
                      </span>
                      {app.phone && (
                        <span className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {app.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        Applied on {fmt(app.submittedAt)}
                      </span>
                    </div>
                    {app.topSkills && app.topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {app.topSkills.slice(0, 8).map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-gray-50 text-gray-700 text-xs font-semibold rounded border border-gray-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0 self-center">
                    {app.status === "Applied" && (
                      <Button
                        size="sm"
                        onClick={() => handleScreen(app._id)}
                        disabled={screeningId === app._id}
                        className="h-10 px-6 font-semibold"
                      >
                        {screeningId === app._id ? (
                          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Screen
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedApp(app)}
                      className="h-10 px-6 font-semibold"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 bg-gray-50/50 px-8 py-4">
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="border-0 shadow-none p-0"
              />
            </div>
          </Card>
        )}
      </div>

      <CreateJobModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          fetchJob();
        }}
        isEdit={true}
        jobId={id as string}
      />

      {/* Detail modal */}
      {selectedApp && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="max-w-2xl w-full bg-white rounded-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <Typography variant="h2" className="text-2xl font-bold text-gray-900">
                  {selectedApp.firstName} {selectedApp.lastName}
                </Typography>
                <div className="flex gap-2 mt-2">
                  <span
                    className={cn(
                      "text-xs px-3 py-1 rounded-full border font-bold",
                      statusColors[selectedApp.status]
                    )}
                  >
                    {selectedApp.status}
                  </span>
                  {selectedApp.score != null && (
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold">
                      Match Score: {selectedApp.score}%
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Email Address</span>
                <p className="font-medium text-gray-900">{selectedApp.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Phone Number</span>
                <p className="font-medium text-gray-900">{selectedApp.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Applied Date</span>
                <p className="font-medium text-gray-900">{fmt(selectedApp.submittedAt)}</p>
              </div>
              {selectedApp.linkedin && (
                <div className="space-y-1">
                  <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">LinkedIn Profile</span>
                  <a
                    href={selectedApp.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-primary font-medium hover:underline truncate"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>

            {selectedApp.summary && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" /> AI Candidate Summary
                </p>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">{selectedApp.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {selectedApp.topSkills && selectedApp.topSkills.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Matching Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.topSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedApp.gaps && selectedApp.gaps.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Identified Gaps</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.gaps.map((g, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-100"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button variant="outline" onClick={() => setSelectedApp(null)} className="px-8">
                Close
              </Button>
              {selectedApp.status === "Applied" && (
                <Button
                  onClick={() => {
                    handleScreen(selectedApp._id);
                    setSelectedApp(null);
                  }}
                  className="px-8"
                >
                  Screen Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}