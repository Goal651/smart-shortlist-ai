import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  candidates: number;
  avgScore: number;
  status: "Active" | "Closed";
  created: string;
}

const recentJobs: Job[] = [
  { id: "1", title: "Senior Frontend Engineer", candidates: 24, avgScore: 72, status: "Active", created: "2026-03-28" },
  { id: "2", title: "Backend Developer", candidates: 18, avgScore: 68, status: "Active", created: "2026-03-25" },
  { id: "3", title: "UI/UX Designer", candidates: 12, avgScore: 81, status: "Active", created: "2026-03-20" },
  { id: "4", title: "DevOps Engineer", candidates: 8, avgScore: 75, status: "Closed", created: "2026-03-15" },
];

export function RecentJobsTable() {
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider font-dm-sans">Job Title</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider font-dm-sans text-center">Candidates</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider font-dm-sans text-center">Avg Score</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider font-dm-sans text-center">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider font-dm-sans text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentJobs.map((job) => (
              <tr key={job.id} className="border-b border-gray-50 last:border-0 grow">
                <td className="px-6 py-5">
                  <Typography variant="body" className="font-medium text-gray-900">{job.title}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <Typography variant="body" className="text-gray-700">{job.candidates}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center h-8 w-12 rounded-full text-xs font-semibold",
                    job.avgScore >= 80 ? "bg-green-50 text-green-600" : 
                    job.avgScore >= 70 ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                  )}>
                    {job.avgScore}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    job.status === "Active" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-600"
                  )}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <Typography variant="body" className="text-gray-600 text-sm">{job.created}</Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
