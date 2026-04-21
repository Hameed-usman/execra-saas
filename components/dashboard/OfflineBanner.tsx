'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface OfflineBannerProps {
  onDismiss?: () => void;
}

export function OfflineBanner({ onDismiss }: OfflineBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
      <div className="bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
          <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-amber-200">
            AI agents are starting up — this takes about 30 seconds on first run
          </p>
          <button 
            onClick={() => {
              setIsVisible(false);
              if (onDismiss) onDismiss();
            }}
            className="ml-auto p-1.5 rounded-md hover:bg-amber-500/10 text-amber-500/70 hover:text-amber-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
