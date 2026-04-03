import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary"
}: StatCardProps) {
  return (
    <Card className="flex flex-col p-6 space-y-4 shadow-none border-gray-100 bg-white">
      <div className={iconBgColor + " p-3 rounded-xl w-fit"}>
        <Icon className={iconColor + " h-6 w-6"} />
      </div>
      
      <div className="space-y-1">
        <Typography variant="h2" className="text-3xl font-semibold text-gray-900 leading-none tracking-tight">
          {value}
        </Typography>
        <Typography variant="small" className="text-sm text-gray-600 font-medium">
          {label}
        </Typography>
      </div>

      {trend && (
        <div className="pt-2">
           <Typography variant="small" className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
            {trend}
           </Typography>
        </div>
      )}
    </Card>
  );
}
