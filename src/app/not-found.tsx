import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1120] px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={28} className="text-gray-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">404</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
