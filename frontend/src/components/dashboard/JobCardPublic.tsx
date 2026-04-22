import { MapPin, Clock, Laptop, Bookmark, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";
import { Job } from "@/types/Job";

interface JobCardProps extends Job {
  // Additional UI-specific props can be added here
}

export function JobCardPublic({ 
  _id,
  title, 
  description,
  location,
  type,
  requirements,
  createdAt 
}: JobCardProps) {
  // Format the creation date
  const postedAt = new Date(createdAt).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Card className="p-8 border-gray-100 bg-white space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex space-x-4">
          <div className="h-14 w-14 bg-primary rounded-xl flex items-center justify-center p-3">
            <Briefcase color="white" className="h-10 w-10" />
          </div>
          <div className="space-y-1">
             <Typography variant="h3" className="text-xl">{title}</Typography>
             <Typography variant="body" className="text-primary font-medium">Umurava</Typography>
          </div>
        </div>
        <span className="px-4 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
           Active
        </span>
      </div>

      <Typography variant="body" className="text-gray-600 leading-relaxed max-w-4xl font-work-sans line-clamp-3">
        {description || 'No job description is available for this position.'}
      </Typography>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <MapPin className="h-3.5 w-3.5 text-gray-500" />
          <Typography variant="small" className="text-gray-700 font-medium">{location || 'Remote'}</Typography>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Clock className="h-3.5 w-3.5 text-gray-500" />
          <Typography variant="small" className="text-gray-700 font-medium">{type || 'Full-time'}</Typography>
        </div>
        {requirements?.minExperience !== undefined && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
            <Laptop className="h-3.5 w-3.5 text-gray-500" />
            <Typography variant="small" className="text-gray-700 font-medium">
              {requirements.minExperience === 0 ? 'No exp. required' : `${requirements.minExperience}+ yrs`}
            </Typography>
          </div>
        )}
        {requirements?.skills && requirements.skills.length > 0 && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100">
            <Typography variant="small" className="text-blue-700 font-medium">
              {requirements.skills.length} Skills
            </Typography>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <Typography variant="small" className="text-gray-600 font-medium">{postedAt}</Typography>
        <div className="flex space-x-3">
           <Link href={`/job/${_id}`}>
              <Button className="font-medium px-8 h-10 shadow-none">View Details</Button>
           </Link>
           <button className="p-2.5 rounded-lg border border-gray-100 transition-all text-gray-600">
             <Bookmark className="h-5 w-5" />
           </button>
        </div>
      </div>
    </Card>
  );
}
