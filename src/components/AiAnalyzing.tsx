import React from 'react';
import { Loader2 } from 'lucide-react';

export default function AiAnalyzing({ small }: { small?: boolean }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-white/6 ${small ? 'text-xs' : 'text-sm'}`}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Doing AI analysis...</span>
    </div>
  );
}
