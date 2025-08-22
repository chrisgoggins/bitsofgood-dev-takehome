import { RequestStatus } from "@/lib/types/request";
import { formatCamelCase } from "@/lib/utils/strings";

const STATUS_META: Record<
  RequestStatus,
  { dot: string; bg: string; text: string }
> = {
  [RequestStatus.PENDING]: {
    dot: "bg-[#FD8033]",    
    bg: "bg-[#FFDAC3]",     
    text: "text-[#A43E00]", 
  },
  [RequestStatus.APPROVED]: {
    dot: "bg-[#FFBE4C]",       
    bg: "bg-[#FFEBC8]",       
    text: "text-[#7B5F2E]",    
  },
  [RequestStatus.COMPLETED]: {
    dot: "bg-[#14BA6D]",       
    bg: "bg-[#ECFDF3]",       
    text: "text-[#037847]",    
  },
  [RequestStatus.REJECTED]: {
    dot: "bg-[#D40400]",   
    bg: "bg-[#FFD2D2]",    
    text: "text-[#8D0402]",
  },
};

export function StatusIcon({ status }: { status: RequestStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-2 ${meta.bg} ${meta.text} rounded-full px-3 py-1.5 text-sm font-medium`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {formatCamelCase(status)}
    </span>
  );
}
