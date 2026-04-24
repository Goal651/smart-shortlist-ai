"use client";

import { useState } from "react";
import { Search, MapPin, Briefcase } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useRouter } from "next/navigation";
import { usePublicJobs } from "@/hooks/useApi";
import { JobCardPublic } from "@/components/dashboard/JobCardPublic";
import Image from "next/image";

export default function JobListingsPage() {
  const { jobs, loading, error } = usePublicJobs();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const router = useRouter();

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation =
      !locationFilter ||
      (job.location || "").toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesExperience =
      !experienceFilter ||
      (experienceFilter === "0" && job.requirements.minExperience === 0) ||
      (experienceFilter === "1-3" &&
        job.requirements.minExperience >= 1 &&
        job.requirements.minExperience <= 3) ||
      (experienceFilter === "3-5" &&
        job.requirements.minExperience >= 3 &&
        job.requirements.minExperience <= 5) ||
      (experienceFilter === "5+" && job.requirements.minExperience >= 5);

    return matchesSearch && matchesLocation && matchesType && matchesExperience;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
                <Image src="/umurava.png" alt="Logo" width={500} height={500} className="" />

              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Umurava Careers</h1>
                <p className="text-xs text-gray-500">Find your next opportunity</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="text-sm"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-3">Join Our Team</h2>
            <p className="text-lg mb-8 text-blue-100">
              Discover exciting opportunities and take your career to the next level
            </p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
              <input
                type="text"
                placeholder="Search jobs by title or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl border-0 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters bar */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[160px] max-w-[220px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="min-w-[150px]">
              <Select
                options={[
                  { label: "All Types", value: "" },
                  { label: "Full-time", value: "Full-time" },
                  { label: "Part-time", value: "Part-time" },
                  { label: "Contract", value: "Contract" },
                  { label: "Remote", value: "Remote" },
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="Job Type"
              />
            </div>

            <div className="min-w-[160px]">
              <Select
                options={[
                  { label: "Any Experience", value: "" },
                  { label: "No Experience", value: "0" },
                  { label: "1-3 Years", value: "1-3" },
                  { label: "3-5 Years", value: "3-5" },
                  { label: "5+ Years", value: "5+" },
                ]}
                value={experienceFilter}
                onChange={setExperienceFilter}
                placeholder="Experience"
              />
            </div>

            {(locationFilter || typeFilter || experienceFilter || searchTerm) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setLocationFilter("");
                  setTypeFilter("");
                  setExperienceFilter("");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear filters
              </Button>
            )}

            <div className="ml-auto text-sm text-gray-500">
              {filteredJobs.length}{" "}
              {filteredJobs.length === 1 ? "position" : "positions"} available
            </div>
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Typography variant="h2" className="text-2xl font-semibold text-gray-900">
            Featured opportunities
          </Typography>
          <Typography variant="body" className="text-gray-500 mt-1">
            Browse current openings on the Umurava job board.
          </Typography>
        </div>

        {error ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Could not load jobs</h3>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No positions found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <JobCardPublic key={job._id} {...job} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; 2026 Umurava AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
