"use client";

import { useState, useEffect } from "react";
import {
  Briefcase, Mail, Phone, Calendar, Search,
  Eye, PlayCircle, CheckCircle, Clock, XCircle
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { apiClient } from "@/services/client";

interface Application {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  status: "Applied" | "Screening" | "Shortlisted" | "Rejected";
  submittedAt: string;
  jobId: { _id: string; title: string; location: string; type: string };
  score?: number;
  summary?: string;
  topSkills?: string[];
  gaps?: string[];
  screenedAt?: string;
}

const statusColors: Record<string, string> = {
  Applied: "bg-blue-50 text-blue-700 border-blue-100",
  Screening: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Shortlisted: "bg-green-50 text-green-700 border-green-100",
  Rejected: "bg-red-50 text-red-700 border-red-100",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "Shortlisted") return <CheckCircle className="h-3.5 w-3.5" />;
  if (status === "Rejected") return <XCircle className="h-3.5 w-3.5" />;
  if (status === "Screening") return <PlayCircle className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningId, setScreeningId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 15;

  const getToken = () => localStorage.getItem("auth_token");

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: PAGE_SIZE,
        ...(statusFilter && { status: statusFilter }),
      };
      const res = await apiClient.get<{ applications: Application[]; pagination: { total: number; pages: number } }>(`/applications`, params);
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
        setTotal(res.data.pagination?.total || 0);
        setTotalPages(res.data.pagination?.pages || 1);
      }
    } finally {
      setLoading(false);
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
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = applications.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.jobId?.title?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-50">
        <div className="space-y-1">
          <Typography variant="h1" className="text-2xl font-medium tracking-tight text-gray-900">Applications</Typography>
          <Typography variant="caption" className="text-gray-600 font-medium font-work-sans">
            {total} total application{total !== 1 ? "s" : ""}
          </Typography>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border-gray-100 shadow-none">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={[
                { label: "All Status", value: "" },
                { label: "Applied", value: "Applied" },
                { label: "Screening", value: "Screening" },
                { label: "Shortlisted", value: "Shortlisted" },
                { label: "Rejected", value: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
              placeholder="All Status"
            />
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center border-gray-100 shadow-none">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-base font-medium text-gray-900 mb-1">No applications found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <Card className="border-gray-100 shadow-none overflow-hidden">
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <div key={app._id} className="p-5 flex items-start justify-between gap-4 hover:bg-gray-50/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{app.firstName} {app.lastName}</p>
                    <span className={cn("inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium", statusColors[app.status])}>
                      <StatusIcon status={app.status} />{app.status}
                    </span>
                    {app.score != null && (
                      <span className={cn("text-xs px-2.5 py-0.5 rounded-full border font-medium",
                        app.score >= 80 ? "bg-green-50 text-green-700 border-green-100" :
                        app.score >= 60 ? "bg-orange-50 text-orange-700 border-orange-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      )}>Score: {app.score}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.email}</span>
                    {app.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.phone}</span>}
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{app.jobId?.title}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(app.submittedAt)}</span>
                  </div>
                  {app.topSkills && app.topSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.topSkills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>
                      ))}
                      {app.topSkills.length > 4 && <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs rounded-full">+{app.topSkills.length - 4}</span>}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {app.status === "Applied" && (
                    <Button size="sm" onClick={() => handleScreen(app._id)} disabled={screeningId === app._id} className="h-8 text-xs">
                      {screeningId === app._id ? (
                        <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />Screening...</>
                      ) : (
                        <><PlayCircle className="h-3.5 w-3.5 mr-1" />Screen</>
                      )}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)} className="h-8 text-xs">
                    <Eye className="h-3.5 w-3.5 mr-1" />View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-50 bg-gray-50/30">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="border-0 shadow-none" />
          </div>
        </Card>
      )}

      {/* Detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <Card className="max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-900">{selectedApp.firstName} {selectedApp.lastName}</p>
                <span className={cn("inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium mt-1", statusColors[selectedApp.status])}>
                  <StatusIcon status={selectedApp.status} />{selectedApp.status}
                </span>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-500 mb-0.5">Email</p><p className="font-medium text-gray-900 truncate">{selectedApp.email}</p></div>
              {selectedApp.phone && <div><p className="text-xs text-gray-500 mb-0.5">Phone</p><p className="font-medium text-gray-900">{selectedApp.phone}</p></div>}
              <div><p className="text-xs text-gray-500 mb-0.5">Position</p><p className="font-medium text-gray-900">{selectedApp.jobId?.title}</p></div>
              <div><p className="text-xs text-gray-500 mb-0.5">Applied</p><p className="font-medium text-gray-900">{fmt(selectedApp.submittedAt)}</p></div>
              {selectedApp.score != null && <div><p className="text-xs text-gray-500 mb-0.5">Score</p><p className="font-semibold text-gray-900">{selectedApp.score}/100</p></div>}
              {selectedApp.screenedAt && <div><p className="text-xs text-gray-500 mb-0.5">Screened</p><p className="font-medium text-gray-900">{fmt(selectedApp.screenedAt)}</p></div>}
              {selectedApp.linkedin && (
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-0.5">LinkedIn</p>
                  <a href={selectedApp.linkedin} target="_blank" className="text-primary text-sm hover:underline truncate block">{selectedApp.linkedin}</a>
                </div>
              )}
            </div>

            {selectedApp.summary && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-semibold text-gray-700 mb-1">AI Summary</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedApp.summary}</p>
              </div>
            )}

            {selectedApp.topSkills && selectedApp.topSkills.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.topSkills.map((s, i) => <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{s}</span>)}
                </div>
              </div>
            )}

            {selectedApp.gaps && selectedApp.gaps.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Skill Gaps</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  {selectedApp.gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>Close</Button>
              {selectedApp.status === "Applied" && (
                <Button onClick={() => { handleScreen(selectedApp._id); setSelectedApp(null); }} disabled={screeningId === selectedApp._id}>
                  Screen Application
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
