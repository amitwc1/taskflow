import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1120]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}
