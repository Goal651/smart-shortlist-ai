import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typography } from "@/components/ui/Typography";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={cn("flex items-center justify-between px-6 py-4 bg-white border-t border-gray-50", className)}>
      <Typography variant="small" className="text-gray-600 font-medium font-work-sans">
        Showing Page {currentPage} of {totalPages}
      </Typography>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "h-9 w-9 rounded-xl text-sm font-medium transition-all",
              currentPage === page 
                ? "bg-primary text-white shadow-none" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100"
            )}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
