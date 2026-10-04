import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

const SLOTS = [
  { id: 'morning', label: 'Morning Catch', time: '7:00 AM – 10:00 AM' },
  { id: 'evening', label: 'Evening Landing', time: '4:00 PM – 7:00 PM' },
];

export default function PincodeChecker() {
  const {
    pincode,
    isServiceable,
    pincodeMessage,
    isVerifying,
    checkPincode,
    deliverySlot,
    setDeliverySlot,
  } = useCartStore();

  const [inputPin, setInputPin] = useState(pincode || '');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (inputPin.trim()) {
      await checkPincode(inputPin);
    }
  };

  return (
    <div className="bg-[#100D2D]/90 p-4 rounded-xl border border-[#D5C582]/20 space-y-4 my-3">
      {/* 1. Pincode Input */}
      <div>
        <label className="block text-[11px] font-bold tracking-wider uppercase text-[#D5C582] mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> Check Mumbai Delivery
        </label>
        <form onSubmit={handleVerify} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter Pincode (e.g. 400071)"
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value)}
            className="flex-1 bg-[#16123D] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#FAF7EE] placeholder-[#FAF7EE]/30 focus:outline-none focus:border-[#D5C582]"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="bg-[#D5C582] hover:bg-[#E5D79E] text-[#1D184D] font-bold px-3 py-1.5 rounded-lg text-xs uppercase cursor-pointer transition-colors flex items-center justify-center min-w-[70px]"
          >
            {isVerifying ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </form>

        {pincodeMessage && (
          <div
            className={`text-[11px] font-medium mt-2 flex items-center gap-1.5 ${
              isServiceable ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isServiceable ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{pincodeMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Delivery Window Selector */}
      <div>
        <label className="block text-[11px] font-bold tracking-wider uppercase text-[#D5C582] mb-1.5 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Preferred Catch Window
        </label>
        <div className="grid grid-cols-2 gap-2">
          {SLOTS.map((slot) => {
            const slotValue = `${slot.label} (${slot.time})`;
            const isSelected = deliverySlot === slotValue;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setDeliverySlot(slotValue)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#D5C582]/20 border-[#D5C582] text-[#FAF7EE] ring-1 ring-[#D5C582]'
                    : 'bg-[#16123D] border-white/5 text-[#FAF7EE]/60 hover:border-white/20'
                }`}
              >
                <div className="text-[11px] font-bold text-[#D5C582]">
                  {slot.label}
                </div>
                <div className="text-[10px] text-[#FAF7EE]/70 font-medium">
                  {slot.time}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}