"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Typography } from "@/components/ui/Typography";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Briefcase, Building2, MapPin, Globe, Clock, FileText, Sparkles } from "lucide-react";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
}

const jobTypeOptions = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

const workModeOptions = [
  { label: "Remote", value: "remote" },
  { label: "On-site", value: "on-site" },
  { label: "Hybrid", value: "hybrid" },
];

export function CreateJobModal({ isOpen, onClose, isEdit }: CreateJobModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    type: "full-time",
    workMode: "remote",
    description: "",
  });

  // Pre-fill if editing (Mock data for now)
  useEffect(() => {
    if (isEdit && isOpen) {
      setFormData({
        title: "Senior Frontend Engineer",
        company: "Umurava",
        location: "Remote",
        type: "full-time",
        workMode: "remote",
        description: "We are looking for an experienced Senior Frontend Engineer to lead the development of our next-generation AI recruitment platform.",
      });
    }
  }, [isEdit, isOpen]);

  const handleSubmit = () => {
    console.log(isEdit ? "Updating job:" : "Creating job:", formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? "Edit Job Details" : "Create New Job"} 
      className="max-w-2xl"
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
              onChange={(val) => setFormData({ ...formData, type: val })}
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

        <div className="space-y-2">
          <Typography variant="body" className="text-[11px] font-medium text-gray-600 tracking-wider ml-1">Job Description</Typography>
          <div className="relative">
            <textarea 
              className="w-full min-h-[120px] rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all font-work-sans text-gray-900 resize-none shadow-none"
              placeholder="Describe the role and requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <FileText className="absolute right-4 bottom-4 h-4 w-4 text-gray-600 opacity-50" />
          </div>
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
                className="h-10 px-8 shadow-none font-medium transition-none text-xs"
              >
                {isEdit ? "Update Job" : "Create Job"}
              </Button>
           </div>
        </div>
      </div>
    </Modal>
  );
}
