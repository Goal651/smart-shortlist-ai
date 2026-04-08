"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Briefcase, Plus, Edit, Trash2, Eye, 
  Search, Filter, ChevronDown, ChevronUp, Users, PlayCircle, Mail
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";

interface Job {
  _id: string;
  title: string;
  description: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  requirements: {
    skills: string[];
    minExperience: number;
    education: string;
  };
  salaryRange?: {
    min?: number;
    max?: number;
    currency: string;
  };
  isActive: boolean;
  createdAt: string;
  applicationCount?: number;
}

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  resumeFile: string;
  status: 'Applied' | 'Screened' | 'Rejected' | 'Accepted';
  submittedAt: string;
  screeningResult?: {
    candidateId: string;
    score: number;
    summary: string;
    topSkills: string[];
    gaps: string[];
    extractedText: string;
    screenedAt: string;
    emailSent: boolean;
    emailSentAt?: string;
  };
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  
  // Modal states
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [screeningJobId, setScreeningJobId] = useState<string | null>(null);
  const [screening, setScreening] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Fetch application counts for each job
        const jobsWithCounts = await Promise.all(
          data.map(async (job: Job) => {
            try {
              const appResponse = await fetch(`/api/applications?jobId=${job._id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              if (appResponse.ok) {
                const appData = await appResponse.json();
                return {
                  ...job,
                  applicationCount: appData.pagination?.total || 0
                };
              } else {
                console.error('Failed to fetch applications for job:', job._id);
                return {
                  ...job,
                  applicationCount: 0
                };
              }
            } catch (error) {
              console.error('Error fetching applications for job:', job._id, error);
              return {
                ...job,
                applicationCount: 0
              };
            }
          })
        );
        setJobs(jobsWithCounts);
      } else {
        console.error('Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData: Partial<Job>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs([...jobs, newJob]);
        setShowCreateModal(false);
      } else {
        console.error('Failed to create job');
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleUpdateJob = async (jobData: Partial<Job>) => {
    if (!editingJob) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/jobs/${editingJob._id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (response.ok) {
        const updatedJob = await response.json();
        setJobs(jobs.map(job => 
          job._id === updatedJob._id ? updatedJob : job
        ));
        setEditingJob(null);
      } else {
        console.error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job._id !== jobId));
      } else {
        console.error('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleToggleActive = async (jobId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        setJobs(jobs.map(job => 
          job._id === jobId ? { ...job, isActive } : job
        ));
      } else {
        console.error('Failed to update job status');
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || job.type === typeFilter;
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-700';
      case 'Part-time': return 'bg-green-100 text-green-700';
      case 'Contract': return 'bg-purple-100 text-purple-700';
      case 'Remote': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const fetchApplications = async (jobId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/applications?jobId=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleScreenApplications = async (jobId: string) => {
    try {
      setScreeningJobId(jobId);
      setScreening(true);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/applications/screen/${jobId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Screening completed:', data);
        
        // Refresh applications to show screening results
        await fetchApplications(jobId);
        
        setScreeningJobId(null);
        setScreening(false);
        setShowApplicantsModal(false);
        
        // Show success message
        alert('Screening completed successfully! Emails will be sent to screened candidates.');
      } else {
        console.error('Failed to screen applications');
        setScreeningJobId(null);
        setScreening(false);
      }
    } catch (error) {
      console.error('Error screening applications:', error);
      setScreeningJobId(null);
      setScreening(false);
    }
  };

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    fetchApplications(job._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="ml-4 text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600">Create and manage job postings</p>
        </div>
        
        <div className="flex space-x-4">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Job
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
            
            <Input
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* Jobs List */}
      <div className="grid gap-6">
        {filteredJobs.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter || locationFilter 
                ? 'Try adjusting your filters' 
                : 'No jobs have been created yet'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Job
            </Button>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(job.type)}`}>
                      {job.type}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {job.location}
                    </span>
                    {job.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {job.description}
                  </p>
                  
                  {job.requirements.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Required Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.skills.slice(0, 5).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requirements.skills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{job.requirements.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewApplicants(job)}
                    className="flex items-center"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Applicants ({job.applicationCount || 0})
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScreenApplications(job._id)}
                    disabled={screeningJobId === job._id || screening || (job.applicationCount || 0) === 0}
                    className="flex items-center text-green-600"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    {screeningJobId === job._id ? 'Screening...' : 'Screen All'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingJob(job)}
                    className="flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(job._id, !job.isActive)}
                    className={`flex items-center ${job.isActive ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {job.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job._id)}
                    className="flex items-center text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingJob) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingJob ? 'Edit Job' : 'Create New Job'}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingJob(null);
                  }}
                >
                  ×
                </Button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingJob) {
                  handleUpdateJob({
                    ...editingJob,
                    title: e.currentTarget.querySelector<HTMLInputElement>('input[name="title"]')?.value || '',
                    description: e.currentTarget.querySelector<HTMLInputElement>('textarea[name="description"]')?.value || '',
                    location: e.currentTarget.querySelector<HTMLInputElement>('input[name="location"]')?.value || 'Remote',
                    type: (e.currentTarget.querySelector<HTMLSelectElement>('select[name="type"]')?.value as 'Full-time' | 'Part-time' | 'Contract' | 'Remote') || 'Full-time',
                    requirements: {
                      skills: [],
                      minExperience: 0,
                      education: ''
                    },
                    salaryRange: {
                      currency: 'RWF'
                    },
                    isActive: true
                  });
                } else {
                  handleCreateJob({
                    title: e.currentTarget.querySelector<HTMLInputElement>('input[name="title"]')?.value || '',
                    description: e.currentTarget.querySelector<HTMLTextAreaElement>('textarea[name="description"]')?.value || '',
                    location: e.currentTarget.querySelector<HTMLInputElement>('input[name="location"]')?.value || 'Remote',
                    type: (e.currentTarget.querySelector<HTMLSelectElement>('select[name="type"]')?.value as 'Full-time' | 'Part-time' | 'Contract' | 'Remote') || 'Full-time',
                    requirements: {
                      skills: [],
                      minExperience: 0,
                      education: ''
                    },
                    salaryRange: {
                      currency: 'RWF'
                    },
                    isActive: true
                  });
                }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    defaultValue={editingJob?.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    defaultValue={editingJob?.description || ''}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue={editingJob?.location || 'Remote'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      defaultValue={editingJob?.type || 'Full-time'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingJob(null);
                    }}
                  >
                    Cancel
                  </Button>
                  
                  <Button type="submit">
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedJob(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedJob.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(selectedJob.type)}`}>
                      {selectedJob.type}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      {selectedJob.location}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedJob.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedJob.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
                
                {selectedJob.requirements.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Experience:</strong> {selectedJob.requirements.minExperience}+ years</div>
                    <div><strong>Education:</strong> {selectedJob.requirements.education || 'Not specified'}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Salary Range</h4>
                  <div className="text-sm text-gray-600">
                    {selectedJob.salaryRange 
                      ? `${selectedJob.salaryRange.currency} ${selectedJob.salaryRange.min?.toLocaleString()} - ${selectedJob.salaryRange.max?.toLocaleString()}`
                      : 'Not specified'
                    }
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  Posted: {formatDate(selectedJob.createdAt)}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Applicants for {selectedJob.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Total Applications: {applications.length}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowApplicantsModal(false)}
                >
                  ×
                </Button>
              </div>

              {/* Screening Button */}
              {applications.length > 0 && (
                <div className="mb-6">
                  <Button
                    onClick={() => handleScreenApplications(selectedJob._id)}
                    disabled={screeningJobId === selectedJob._id || screening}
                    className="w-full flex items-center justify-center text-green-600"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {screeningJobId === selectedJob._id ? 'Screening in progress...' : `Screen All ${applications.length} Applicants`}
                  </Button>
                </div>
              )}

              {/* Applications List */}
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                    <p className="text-gray-600">
                      Applications will appear here when candidates apply for this position.
                    </p>
                  </div>
                ) : (
                  applications.map((application) => (
                    <Card key={application._id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h4 className="font-semibold text-gray-900">{application.name}</h4>
                            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                              application.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                              application.status === 'Screened' ? 'bg-green-100 text-green-700' :
                              application.status === 'Accepted' ? 'bg-purple-100 text-purple-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {application.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Email:</strong> {application.email}</div>
                            <div><strong>Phone:</strong> {application.phone}</div>
                            {application.linkedin && (
                              <div><strong>LinkedIn:</strong> {application.linkedin}</div>
                            )}
                            <div><strong>Applied:</strong> {formatDate(application.submittedAt)}</div>
                          </div>

                          {/* Screening Results */}
                          {application.screeningResult && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                              <h5 className="font-medium text-gray-900 mb-2">Screening Results</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Score:</strong> 
                                  <span className={`ml-2 px-2 py-1 rounded-full ${
                                    application.screeningResult.score >= 80 ? 'bg-green-100 text-green-700' :
                                    application.screeningResult.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {application.screeningResult.score}/100
                                  </span>
                                </div>
                                <div>
                                  <strong>Screened:</strong> {formatDate(application.screeningResult.screenedAt)}
                                </div>
                                <div>
                                  <strong>Email Sent:</strong> 
                                  <span className={`ml-2 px-2 py-1 rounded-full ${
                                    application.screeningResult.emailSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {application.screeningResult.emailSent ? 'Yes' : 'No'}
                                  </span>
                                </div>
                              </div>
                              
                              {application.screeningResult.topSkills.length > 0 && (
                                <div className="mt-3">
                                  <strong>Top Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {application.screeningResult.topSkills.map((skill, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {application.screeningResult.summary && (
                                <div className="mt-3">
                                  <strong>Summary:</strong>
                                  <p className="text-gray-600 text-sm mt-1">{application.screeningResult.summary}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${application.email}`)}
                            className="flex items-center"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicantsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
