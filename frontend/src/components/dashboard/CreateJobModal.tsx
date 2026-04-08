"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Briefcase, Building2, MapPin, FileText, Sparkles } from "lucide-react";
import { useJobs } from '@/hooks/useApi';
import { useToast } from '@/contexts/ToastContext';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  jobId?: string;
}

const jobTypeOptions = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
  { label: "Remote", value: "Remote" },
];

const workModeOptions = [
  { label: "Remote", value: "Remote" },
  { label: "On-site", value: "On-site" },
  { label: "Hybrid", value: "Hybrid" },
];

export function CreateJobModal({ isOpen, onClose, isEdit, jobId }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "Remote",
    type: "Full-time" as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
    requirements: {
      skills: [] as string[],
      minExperience: 0,
      education: "",
    },
    salaryRange: {
      min: 0,
      max: 0,
      currency: "RWF",
    },
    // UI-only fields
    company: "Umurava",
    workMode: "remote",
  });

  const [newSkill, setNewSkill] = useState("");

  const { createJob, jobs } = useJobs();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Pre-fill if editing
  useEffect(() => {
    if (isEdit && isOpen && jobId) {
      const jobToEdit = jobs.find(job => job._id === jobId);
      if (jobToEdit) {
        setFormData({
          title: jobToEdit.title,
          description: jobToEdit.description,
          location: jobToEdit.location || "Remote",
          type: jobToEdit.type || "Full-time",
          requirements: jobToEdit.requirements || {
            skills: [],
            minExperience: 0,
            education: "",
          },
          salaryRange: jobToEdit.salaryRange || {
            min: 0,
            max: 0,
            currency: "RWF",
          },
          // UI-only fields
          company: "Umurava",
          workMode: "remote",
        });
      }
    } else if (isOpen && !isEdit) {
      // Reset form for new job
      setFormData({
        title: "",
        description: "",
        location: "Remote",
        type: "Full-time",
        requirements: {
          skills: [],
          minExperience: 0,
          education: "",
        },
        salaryRange: {
          min: 0,
          max: 0,
          currency: "RWF",
        },
        // UI-only fields
        company: "Umurava",
        workMode: "remote",
      });
      setNewSkill("");
    }
  }, [isEdit, isOpen, jobId, jobs]);

  const addSkill = () => {
    if (newSkill.trim() && !formData.requirements.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        requirements: {
          ...formData.requirements,
          skills: [...formData.requirements.skills, newSkill.trim()]
        }
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      requirements: {
        ...formData.requirements,
        skills: formData.requirements.skills.filter(skill => skill !== skillToRemove)
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast({
        title: "Missing title",
        description: "Please fill in job title.",
        variant: "error",
      });
      return;
    }

    if (!formData.description.trim()) {
      showToast({
        title: "Missing description",
        description: "Please fill in job description.",
        variant: "error",
      });
      return;
    }

    if (formData.description.trim().length < 100) {
      showToast({
        title: "Description too short",
        description: "Job description must be at least 100 characters.",
        variant: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      // For now, only support creating new jobs
      // Edit functionality would need updateJob in the backend
      if (isEdit) {
        showToast({
          title: "Edit not ready",
          description: "Edit functionality is not yet implemented.",
          variant: "info",
        });
        return;
      }

      await createJob({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location,
        type: formData.type,
        requirements: formData.requirements,
        salaryRange: formData.salaryRange.min > 0 ? formData.salaryRange : undefined,
      });

      showToast({
        title: "Job posted",
        description: "Your job has been successfully posted.",
        variant: "success",
      });
      onClose();
    } catch (error) {
      console.error('Failed to save job:', error);
      showToast({
        title: "Save failed",
        description: "Failed to save job. Please try again.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? "Edit Job Details" : "Create New Job"} 
      className="max-w-2xl max-h-[80vh] overflow-y-auto"
    >
      <div className="space-y-6">
        <Typography variant="body" className="text-gray-600 font-medium text-xs">
          {isEdit 
            ? "Update the job information below to reflect changes in requirements or role details."
            : "Fill in the details below to post a new job opportunity and start AI screening."
          }
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input 
            label="Job Title" 
            placeholder="e.g. Senior Frontend Engineer" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            icon={<Briefcase className="h-4 w-4" />}
          />
          <Input 
            label="Company" 
            placeholder="e.g. Umurava AI" 
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            icon={<Building2 className="h-4 w-4" />}
          />
          <Input 
            label="Location" 
            placeholder="e.g. Kigali, Rwanda" 
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            icon={<MapPin className="h-4 w-4" />}
          />
          <div className="space-y-1.5">
            <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Job Type</Typography>
            <Select 
              options={jobTypeOptions} 
              value={formData.type} 
              onChange={(val) => setFormData({ ...formData, type: val as "Full-time" | "Part-time" | "Contract" | "Remote" })}
              placeholder="Select Job Type"
            />
          </div>
          <div className="space-y-1.5">
            <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Work Mode</Typography>
            <Select 
              options={workModeOptions} 
              value={formData.workMode} 
              onChange={(val) => setFormData({ ...formData, workMode: val })}
              placeholder="Select Work Mode"
            />
          </div>
        </div>

        {/* Requirements Section */}
        <div className="space-y-4">
          <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Requirements</Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Typography variant="caption" className="text-[10px] font-medium text-gray-600 tracking-wider ml-1">Skills</Typography>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill} size="sm">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-medium flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-primary/60 hover:text-primary">×</button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Typography variant="caption" className="text-[10px] font-medium text-gray-600 tracking-wider ml-1">Min Experience (years)</Typography>
              <input 
                type="number"
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary "
                placeholder="0"
                value={formData.requirements.minExperience}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, minExperience: parseInt(e.target.value) || 0 }
                })}
              />
            </div>
            
            <div className="space-y-1.5">
              <Typography variant="caption" className="text-[10px] font-medium text-gray-600 tracking-wider ml-1">Education</Typography>
              <input 
                type="text"
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Bachelor's in CS"
                value={formData.requirements.education}
                onChange={(e) => setFormData({
                  ...formData,
                  requirements: { ...formData.requirements, education: e.target.value }
                })}
              />
            </div>
          </div>
        </div>

        {/* Salary Range Section */}
        <div className="space-y-4">
          <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Salary Range (Optional)</Typography>
          <div className="grid grid-cols-3 gap-5">
            <input 
              type="number"
              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Min salary"
              value={formData.salaryRange.min || ""}
              onChange={(e) => setFormData({
                ...formData,
                salaryRange: { ...formData.salaryRange, min: parseInt(e.target.value) || 0 }
              })}
            />
            <input 
              type="number"
              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Max salary"
              value={formData.salaryRange.max || ""}
              onChange={(e) => setFormData({
                ...formData,
                salaryRange: { ...formData.salaryRange, max: parseInt(e.target.value) || 0 }
              })}
            />
            <Select 
              options={[
                { label: "RWF", value: "RWF" },
                { label: "USD", value: "USD" },
                { label: "EUR", value: "EUR" },
              ]}
              value={formData.salaryRange.currency}
              onChange={(val) => setFormData({
                ...formData,
                salaryRange: { ...formData.salaryRange, currency: val }
              })}
              placeholder="Currency"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Job Description</Typography>
          <div className="relative">
            <textarea 
              className="w-full min-h-[120px] rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary transition-all font-work-sans text-gray-900 resize-none shadow-none"
              placeholder="Describe the role and requirements (minimum 100 characters)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FileText className="absolute right-4 bottom-4 h-4 w-4 text-gray-600 opacity-50" />
          </div>
          <Typography variant="caption" className="text-gray-500 text-xs">
            {formData.description.length}/100 characters minimum
          </Typography>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
           <div className="flex items-center space-x-2 text-primary font-medium text-[10px] tracking-widest">
              <Sparkles className="h-3 w-3" />
              <span>Ready for AI Analysis</span>
           </div>
           <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="h-10 px-6 shadow-none border-gray-100 font-medium text-xs text-gray-600 hover:bg-gray-50 transition-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="h-10 px-8 shadow-none font-medium transition-none text-xs"
              >
                {loading ? "Creating..." : (isEdit ? "Edit Not Available" : "Create Job")}
              </Button>
           </div>
        </div>
      </div>
    </Modal>
  );
}
