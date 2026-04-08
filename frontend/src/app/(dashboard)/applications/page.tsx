"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, User, Mail, Phone, Calendar, Filter, 
  Search, Eye, PlayCircle, CheckCircle, Clock, XCircle,
  Download, ChevronDown, ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Typography } from "@/components/ui/Typography";

interface Application {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  status: 'Applied' | 'Screening' | 'Shortlisted' | 'Rejected';
  submittedAt: string;
  jobId: {
    _id: string;
    title: string;
    location: string;
    type: string;
  };
  score?: number;
  summary?: string;
  topSkills?: string[];
  gaps?: string[];
  screenedAt?: string;
  emailSent?: boolean;
}

interface ApplicationsResponse {
  applications: Application[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [screeningLoading, setScreeningLoading] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, jobFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        ...(statusFilter && { status: statusFilter }),
        ...(jobFilter && { jobId: jobFilter })
      });

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/applications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data: ApplicationsResponse = await response.json();
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScreenApplication = async (applicationId: string) => {
    try {
      setScreeningLoading(applicationId);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/applications/${applicationId}/screen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh applications to get updated data
        await fetchApplications();
        
        // Show success message
        alert(`Application screened successfully! Score: ${result.screening.score}`);
      } else {
        const error = await response.json();
        alert(`Screening failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error screening application:', error);
      alert('Screening failed. Please try again.');
    } finally {
      setScreeningLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Screening':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Shortlisted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Applied':
        return <Clock className="h-4 w-4" />;
      case 'Screening':
        return <PlayCircle className="h-4 w-4" />;
      case 'Shortlisted':
        return <CheckCircle className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobId.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600">Manage and screen job applications</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {pagination.total} total applications
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
            
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
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Filter by job..."
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card className="p-8 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter || jobFilter 
                ? 'Try adjusting your filters' 
                : 'No applications have been submitted yet'
              }
            </p>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{application.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status}</span>
                    </span>
                    {application.score && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border-purple-200">
                        Score: {application.score}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-1" />
                      {application.email}
                    </div>
                    {application.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {application.phone}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-1" />
                      {application.jobId.title}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Applied {formatDate(application.submittedAt)}
                    </div>
                  </div>

                  {application.topSkills && application.topSkills.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-1">Top Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {application.topSkills.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {application.topSkills.length > 4 && (
                          <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                            +{application.topSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {application.summary && (
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Summary:</strong> {application.summary}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {application.status === 'Applied' && (
                    <Button
                      size="sm"
                      onClick={() => handleScreenApplication(application._id)}
                      disabled={screeningLoading === application._id}
                      className="flex items-center"
                    >
                      {screeningLoading === application._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Screening...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Screen
                        </>
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                    className="flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.pages}
          </span>
          
          <Button
            variant="outline"
            disabled={currentPage === pagination.pages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">Application Details</h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedApplication(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Name:</strong> {selectedApplication.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedApplication.email}
                    </div>
                    {selectedApplication.phone && (
                      <div>
                        <strong>Phone:</strong> {selectedApplication.phone}
                      </div>
                    )}
                    {selectedApplication.linkedin && (
                      <div>
                        <strong>LinkedIn:</strong> 
                        <a href={selectedApplication.linkedin} target="_blank" className="text-blue-600 hover:underline ml-1">
                          View Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Job Information</h3>
                  <div className="text-sm">
                    <div><strong>Position:</strong> {selectedApplication.jobId.title}</div>
                    <div><strong>Location:</strong> {selectedApplication.jobId.location}</div>
                    <div><strong>Type:</strong> {selectedApplication.jobId.type}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Application Status</h3>
                  <div className="text-sm">
                    <div><strong>Status:</strong> {selectedApplication.status}</div>
                    <div><strong>Applied:</strong> {formatDate(selectedApplication.submittedAt)}</div>
                    {selectedApplication.screenedAt && (
                      <div><strong>Screened:</strong> {formatDate(selectedApplication.screenedAt)}</div>
                    )}
                    {selectedApplication.score && (
                      <div><strong>Score:</strong> {selectedApplication.score}/100</div>
                    )}
                  </div>
                </div>
                
                {selectedApplication.summary && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI Summary</h3>
                    <p className="text-sm text-gray-600">{selectedApplication.summary}</p>
                  </div>
                )}
                
                {selectedApplication.topSkills && selectedApplication.topSkills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Top Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.topSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedApplication.gaps && selectedApplication.gaps.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Skill Gaps</h3>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {selectedApplication.gaps.map((gap, index) => (
                        <li key={index}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
                {selectedApplication.status === 'Applied' && (
                  <Button
                    onClick={() => {
                      handleScreenApplication(selectedApplication._id);
                      setSelectedApplication(null);
                    }}
                    disabled={screeningLoading === selectedApplication._id}
                  >
                    {screeningLoading === selectedApplication._id ? 'Screening...' : 'Screen Application'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
