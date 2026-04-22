"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Clock, DollarSign, Briefcase, GraduationCap, 
  Upload, Send, ArrowLeft, CheckCircle, AlertCircle 
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { apiClient } from "@/services/client";

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
    min: number;
    max: number;
    currency: string;
  };
  createdAt: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    resume: null as File | null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const response = await apiClient.get<Job>(`/jobs/${jobId}/public`);
      if (response.success && response.data) {
        setJob(response.data);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    } else if (formData.resume.size > 5 * 1024 * 1024) {
      newErrors.resume = 'Resume must be less than 5MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('jobId', jobId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('linkedin', formData.linkedin);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await apiClient.postFormData('/applications', formDataToSend);

      if (response.success) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          linkedin: '',
          resume: null as File | null
        });
      } else {
        setErrors({ submit: response.message || 'Failed to submit application' });
      }
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.error || 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (salaryRange?: any) => {
    if (!salaryRange) return 'Competitive';
    const { min, max, currency } = salaryRange;
    if (min && max) {
      return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return min ? `${currency} ${min.toLocaleString()}+` : 'Competitive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
          <Button onClick={() => router.push('/')}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in the {job.title} position. We'll review your application and get back to you soon.
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push('/')} className="w-full">
              Browse More Jobs
            </Button>
            <Button variant="outline" onClick={() => setShowSuccess(false)} className="w-full">
              Apply Another Position
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatSalary(job.salaryRange)}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
                <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Experience</h3>
                    </div>
                    <p className="text-gray-600 ml-7">
                      {job.requirements.minExperience > 0 
                        ? `${job.requirements.minExperience}+ years of experience`
                        : 'No minimum experience required'
                      }
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Education</h3>
                    </div>
                    <p className="text-gray-600 ml-7">
                      {job.requirements.education || 'No specific education requirement'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center mb-3">
                      <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-gray-900">Required Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-7">
                      {job.requirements.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Apply for this Position</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={errors.name}
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+250 788 123 456"
                />

                <Input
                  label="LinkedIn Profile"
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, resume: file });
                          setErrors({ ...errors, resume: '' });
                        }
                      }}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className={`
                        flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                        ${errors.resume 
                          ? 'border-red-300 bg-red-50' 
                          : formData.resume 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }
                      `}
                    >
                      <Upload className="h-6 w-6 mr-2 text-gray-400" />
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {formData.resume ? formData.resume.name : 'Upload your resume'}
                        </div>
                        <div className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, XLSX (Max 5MB)
                        </div>
                      </div>
                    </label>
                  </div>
                  {errors.resume && (
                    <p className="text-sm text-red-600 mt-1">{errors.resume}</p>
                  )}
                </div>

                {errors.submit && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  By submitting this application, you confirm that the information provided is accurate and complete.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
