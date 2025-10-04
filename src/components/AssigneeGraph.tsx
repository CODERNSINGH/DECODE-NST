import React from 'react';

interface Props {
  successRate: number; // 0-100
  completionProbability?: number; // 0-100 (from AI)
}

export default function AssigneeGraph({ successRate, completionProbability }: Props) {
  const success = Math.max(0, Math.min(100, Math.round(successRate)));
  const prob = completionProbability !== undefined ? Math.max(0, Math.min(100, Math.round(completionProbability))) : null;

  // playful gradient colors
  const barColor = success >= 70 ? 'bg-gradient-to-r from-green-400 to-green-600' : success >= 40 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' : 'bg-gradient-to-r from-red-300 to-red-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <div>Success rate</div>
        </div>
        <div className="font-bold text-lg">{success}%</div>
      </div>

      <div className="w-full bg-[rgba(255,255,255,0.06)] rounded-full h-4 overflow-hidden border border-white/6 shadow-inner">
        <div
          className={`h-4 rounded-full ${barColor} transition-all duration-700`}
          style={{ width: `${success}%` }}
        />
      </div>

      {prob !== null && (
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="mr-2">🤖</span>
          AI thinks: <span className="font-medium">{prob}%</span>
        </div>
      )}
    </div>
  );
}
