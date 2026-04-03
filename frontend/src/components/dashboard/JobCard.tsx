import { MapPin, Clock, Laptop, Bookmark } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import Image from "next/image";
import Link from "next/link";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: string;
  workMode: string;
  postedAt: string;
}

export function JobCard({ 
  id,
  title, 
  company, 
  description, 
  location, 
  type, 
  workMode, 
  postedAt 
}: JobCardProps) {
  return (
    <Card className="p-8 border-gray-100 bg-white space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex space-x-4">
          <div className="h-14 w-14 bg-primary rounded-xl flex items-center justify-center p-3">
             <Image src="/umurava.png" alt="Company Logo" width={32} height={32} className="object-contain" />
          </div>
          <div className="space-y-1">
             <Typography variant="h3" className="text-xl">{title}</Typography>
             <Typography variant="body" className="text-primary font-medium">{company}</Typography>
          </div>
        </div>
        <span className="px-4 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-100">
           Active
        </span>
      </div>

      <Typography variant="body" className="text-gray-600 leading-relaxed max-w-4xl font-work-sans">
        {description}
      </Typography>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <MapPin className="h-4 w-4 text-gray-600" />
          <Typography variant="small" className="text-gray-700 font-medium">{location}</Typography>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Clock className="h-4 w-4 text-gray-600" />
          <Typography variant="small" className="text-gray-700 font-medium">{type}</Typography>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
          <Laptop className="h-4 w-4 text-gray-600" />
          <Typography variant="small" className="text-gray-700 font-medium">{workMode}</Typography>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <Typography variant="small" className="text-gray-600 font-medium">{postedAt}</Typography>
        <div className="flex space-x-3">
           <Link href={`/jobs/${id}`}>
              <Button className="font-semibold px-8 h-10 shadow-none">View Details</Button>
           </Link>
           <button className="p-2.5 rounded-lg border border-gray-100 transition-all text-gray-600">
             <Bookmark className="h-5 w-5" />
           </button>
        </div>
      </div>
    </Card>
  );
}
