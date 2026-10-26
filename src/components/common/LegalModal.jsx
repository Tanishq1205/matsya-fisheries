import { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, Truck } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const tabs = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'refund', label: 'Refund & Returns', icon: RefreshCw },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#FAF7EE] text-[#1D184D] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#1D184D]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#1D184D] text-[#FAF7EE] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold font-serif tracking-wide">Matsya Fisheries — Legal & Regulatory</h2>
            <p className="text-xs text-[#FAF7EE]/70 mt-0.5">
              GSTIN: <span className="font-mono font-semibold text-white">27AAUCM6344G1ZZ</span> | FSSAI Lic No: <span className="font-mono font-semibold text-white">2152600300033</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#FAF7EE] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1D184D]/10 bg-[#FAF7EE] px-6 gap-2 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#1D184D] text-[#1D184D]'
                    : 'border-transparent text-[#1D184D]/50 hover:text-[#1D184D]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Policy Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-[#1D184D]/80 leading-relaxed font-sans">
          
          {/* TERMS OF SERVICE */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#1D184D]">Terms & Conditions</h3>
              <p>Welcome to <strong>Matsya Fisheries</strong>. By placing an order via our platform, you agree to be bound by the following operational terms.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">1. Fresh Seafood Nature & Weight Variations</h4>
              <p>Seafood is caught daily at dock landing sites in Mumbai. Final weights are recorded prior to scaling, cleaning, and gutting. The weight delivered represents gross raw catch weight unless net weight is specified. Natural variations up to ±5% in gross landing weights may occur.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">2. Business Identification</h4>
              <p>Operating as <strong>Matsya Fisheries</strong> in Chembur, Mumbai, Maharashtra. <br />
              • <strong>GSTIN:</strong> 27AAUCM6344G1ZZ<br />
              • <strong>FSSAI Registration:</strong> 2152600300033</p>

              <h4 className="font-bold text-[#1D184D] pt-2">3. Orders & Cancellation</h4>
              <p>Because raw catch items are freshly cut, cleaned, and dispatched strictly per morning catch schedules, orders cannot be cancelled once dock processing has commenced (`dock_processing` status).</p>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#1D184D]">Privacy Policy</h3>
              <p>Matsya Fisheries values customer data protection. This policy outlines how personal details are gathered and stored.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">1. Data Collection</h4>
              <p>We collect essential order fulfillment details including full name, delivery address, pincode, phone number, and email address upon checkout placement.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">2. Data Utilization & Security</h4>
              <p>Information is strictly utilized for dispatch coordination, WhatsApp receipt notifications, and delivery routing. Data is stored within secure encrypted cloud infrastructure (Supabase) with Row Level Security (RLS) enforcement. We never sell, rent, or trade customer contact details to third parties.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">3. Contact for Data Removal</h4>
              <p>Customers may request erasure of address or contact history by reaching our dock support team on WhatsApp or emailing <code>matsyafisheries@gmail.com</code>.</p>
            </div>
          )}

          {/* REFUND & RETURN POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#1D184D]">Refund & Return Policy</h3>
              <p>Due to the perishable nature of fresh seafood products, standard physical returns cannot be accepted once delivery is completed.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">1. Quality & Freshness Guarantee</h4>
              <p>If you receive fish that is damaged, uncleaned, or fails our freshness criteria, notify our dock team within <strong>2 hours of delivery receipt</strong> with photographic evidence sent to our WhatsApp line.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">2. Resolution Options</h4>
              <p>Verified quality claims will receive either:<br />
              • An immediate replacement dispatch in the next available catch slot, or<br />
              • A full refund credited via original payment method (or UPI) within 24–48 hours.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">3. Non-Refundable Conditions</h4>
              <p>Refunds will not be issued for incorrect delivery addresses provided by the customer or unavailability at the designated delivery slot.</p>
            </div>
          )}

          {/* SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#1D184D]">Shipping & Delivery Policy</h3>
              <p>Matsya Fisheries operates a cold-chain dock-to-door fresh catch logistics network across serviceable pincodes in Mumbai.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">1. Cold-Chain Packaging</h4>
              <p>All catch cuts are cleaned, packed in food-grade thermal ice trays, and dispatched sealed to maintain optimal core temperature during transit.</p>

              <h4 className="font-bold text-[#1D184D] pt-2">2. Delivery Slots & Timings</h4>
              <p>Orders are dispatched according to designated catch slots:<br />
              • <strong>Morning Catch Slot:</strong> 7:00 AM – 10:00 AM<br />
              • <strong>Evening Catch Slot:</strong> 4:00 PM – 7:00 PM</p>

              <h4 className="font-bold text-[#1D184D] pt-2">3. Shipping Fees</h4>
              <p>Standard delivery is complimentary for orders exceeding minimum threshold requirements. Orders below thresholds carry nominal distance-based logistics fees calculated during checkout.</p>
            </div>
          )}

        </div>

        {/* Footer info bar */}
        <div className="px-6 py-4 bg-[#1D184D]/5 border-t border-[#1D184D]/10 flex items-center justify-between shrink-0 text-xs text-[#1D184D]/60 font-medium">
          <span>Matsya Fisheries © 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1D184D] text-[#FAF7EE] rounded-xl font-bold hover:bg-[#1D184D]/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}