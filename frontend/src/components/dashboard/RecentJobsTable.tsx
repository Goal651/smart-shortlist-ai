import { Typography } from "@/components/ui/Typography";
import { cn } from "@/lib/utils";
import { useJobs, useScreening } from '@/hooks/useApi';
import { useEffect, useState } from 'react';

interface JobWithStats {
  _id: string;
  title: string;
  candidates: number;
  avgScore: number;
  status: "Active" | "Closed";
  created: string;
}

export function RecentJobsTable() {
  const { jobs } = useJobs();
  const [jobsWithStats, setJobsWithStats] = useState<JobWithStats[]>([]);

  useEffect(() => {
    const calculateJobStats = async () => {
      const jobsStats: JobWithStats[] = jobs.map(job => {
        // For now, we'll use placeholder stats since we need candidate data
        // In a real implementation, you'd fetch candidate counts and scores for each job
        return {
          _id: job._id,
          title: job.title,
          candidates: 0, // Would be calculated from real candidate data
          avgScore: 0, // Would be calculated from real candidate scores
          status: "Active", // Would come from job data
          created: new Date(job.createdAt).toLocaleDateString('en-CA')
        };
      });
      
      setJobsWithStats(jobsStats);
    };

    if (jobs.length > 0) {
      calculateJobStats();
    }
  }, [jobs]);
  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-50">
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans">Job Title</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Candidates</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Avg Score</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-center">Status</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-600 tracking-wider font-dm-sans text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {jobsWithStats.map((job) => (
              <tr key={job._id} className="border-b border-gray-50 last:border-0 grow">
                <td className="px-6 py-5">
                  <Typography variant="body" className="font-medium text-gray-900">{job.title}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <Typography variant="body" className="text-gray-700">{job.candidates}</Typography>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className={cn(
                    "inline-flex items-center justify-center h-8 w-12 rounded-full text-xs font-medium",
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
