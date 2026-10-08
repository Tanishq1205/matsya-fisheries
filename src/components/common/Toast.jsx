import React, { useEffect, useState } from 'react';
import { ShoppingBag, X, CheckCircle2 } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export default function Toast() {
  const { toast, hideToast } = useToastStore();
  const [isVisible, setIsVisible] = useState(false);
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (toast) {
      setActiveToast(toast);
      setIsVisible(false); // Force initial hidden state in DOM

      // 20ms delay guarantees the browser paints opacity-0 before animating to opacity-100
      const enterTimer = setTimeout(() => {
        setIsVisible(true);
      }, 20);

      // Auto dismiss after 3 seconds
      const autoDismissTimer = setTimeout(() => {
        handleDismiss();
      }, 3000);

      return () => {
        clearTimeout(enterTimer);
        clearTimeout(autoDismissTimer);
      };
    }
  }, [toast]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait 300ms for fade-out transition before unmounting
    setTimeout(() => {
      hideToast();
      setActiveToast(null);
    }, 300);
  };

  if (!activeToast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-sm w-full px-4 transition-all duration-300 ease-out pointer-events-auto ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className="bg-[#1D184D] text-[#FAF7EE] border-2 border-[#D5C582] p-4 rounded-2xl shadow-[0_12px_32px_rgba(29,24,77,0.45)] flex items-start gap-3 backdrop-blur-md">
        
        {/* Icon Badge */}
        <div className="w-9 h-9 rounded-xl bg-[#D5C582]/15 border border-[#D5C582]/40 flex items-center justify-center shrink-0 mt-0.5">
          <ShoppingBag className="w-5 h-5 text-[#D5C582]" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#D5C582]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#6EE7A8]" />
            <span>Added to Basket</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#FAF7EE] mt-0.5 leading-snug truncate">
            {activeToast.message}
          </p>
          {activeToast.subtext && (
            <p className="text-[11px] font-semibold text-[#FAF7EE]/60 mt-0.5">
              {activeToast.subtext}
            </p>
          )}
        </div>

        {/* Manual Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close notification"
          className="text-[#FAF7EE]/50 hover:text-[#FAF7EE] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}