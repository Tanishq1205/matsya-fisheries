import { useEffect } from 'react';
import { business } from '../../config/business';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, Truck } from 'lucide-react';

export default function LegalPolicyPage({ policyType = 'privacy', onBackToCatalog }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [policyType]);

  const policies = [
    { id: 'privacy', slug: 'privacy-policy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', slug: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'refund', slug: 'refund-policy', label: 'Refund & Cancellation', icon: RefreshCw },
    { id: 'shipping', slug: 'shipping-policy', label: 'Shipping & Delivery', icon: Truck },
  ];

  const currentPolicy = policies.find((p) => p.id === policyType || p.slug === policyType) || policies[0];

  const handleTabClick = (slug) => {
    window.location.assign(`#${slug}`);
  };

  return (
    <div className="min-h-screen pt-24 bg-white text-[#1D184D] font-sans antialiased">
      {/* Top Header Navigation */}
      <header className="relative z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <button
            onClick={onBackToCatalog}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D184D] hover:text-[#C2542D] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>

          <div className="flex items-center gap-2">
            <span className="font-serif font-extrabold text-lg tracking-widest text-[#1D184D]">MATSYA</span>
            <span className="text-xs text-gray-400">| Regulatory Documents</span>
          </div>
        </div>
      </header>

      {/* Policy Navigation Tabs */}
      <nav className="bg-[#FAF7EE] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex overflow-x-auto scrollbar-none">
          {policies.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentPolicy.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.slug)}
                className={`py-4 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#1D184D] text-[#1D184D] bg-white shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-[#1D184D]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Document Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 md:py-14">
        
        {/* Title & Metadata */}
        <div className="border-b border-gray-200 pb-6 mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-heading text-[#1D184D] uppercase">
            {currentPolicy.label}
          </h1>
          <p className="text-xs text-gray-500 mt-2 font-mono">
            Matsya Fisheries • GSTIN: <strong className="text-gray-800">27AAUCM6344G1ZZ</strong> • FSSAI Lic No: <strong className="text-gray-800">2152600300033</strong>
          </p>
        </div>

        {/* Disclaimer Notice Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 mb-8 text-xs text-gray-600 leading-relaxed font-sans italic">
          <strong>Disclaimer:</strong> Matsya Fisheries reserves the right to amend this regulatory policy periodically to comply with updated food safety guidelines, municipal dock regulations, or platform operational procedures. Please review this document regularly.
        </div>

        <section className="mb-8 text-sm space-y-2" aria-label="Business contact">
          <h2 className="font-bold">Business contact and grievances</h2>
          {business.email && <p>Email: <a href={'mailto:' + business.email}>{business.email}</a></p>}
          {business.address && <p>Business address: {business.address}</p>}
          {business.grievanceOfficer && <p>Grievance officer: {business.grievanceOfficer}</p>}
          {business.grievanceEmail && <p>Grievances: <a href={'mailto:' + business.grievanceEmail}>{business.grievanceEmail}</a></p>}
          <p>Order support: <a href="https://wa.me/919372379317">WhatsApp +91 93723 79317</a></p>
        </section>
        {/* --- POLICY CONTENT CLAUSES --- */}
        <div className="space-y-8 text-sm text-gray-800 leading-relaxed font-normal">

          {/* PRIVACY POLICY */}
          {currentPolicy.id === 'privacy' && (
            <>
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  A. What kind of personal information do we collect from you?
                </h2>
                <ol className="list-decimal pl-5 space-y-2.5 text-xs sm:text-sm text-gray-700">
                  <li>
                    <strong>Order Placement Data:</strong> To process dock dispatches, we require your full name, mobile number, delivery address, pincode, and optional landmark details.
                  </li>
                  <li>
                    <strong>Communication & Tracking Logs:</strong> We maintain dispatch history and WhatsApp receipt generation records to confirm order fulfillment and status updates.
                  </li>
                  <li>
                    <strong>Technical Diagnostics:</strong> Browser session data, location preferences, and cart configurations are retained temporarily to ensure seamless catalog navigation.
                  </li>
                </ol>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  B. How do we use and safeguard your data?
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Order details are stored in Supabase to process deliveries and provide order support. This browser stores your cart, delivery preferences and saved checkout details; you can remove them by clearing site data. Contact details are used exclusively for delivery routing, order tracking, and receipt notifications. We strictly never sell, trade, or expose customer contact history to external market agencies.
                </p>
              </section>
            </>
          )}

          {/* TERMS OF SERVICE */}
          {currentPolicy.id === 'terms' && (
            <>
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  1. Fresh Catch Weight & Preparation Rules
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Seafood items are sourced daily from Bhaucha Dhakka and Sassoon Docks in Mumbai. All raw weights represent gross landing weights prior to gutting, scaling, and cleaning. Post-cleaning weight loss naturally varies between 15% to 35% depending on the specific fish variety and requested cut style.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  2. Order Confirmation & Lock
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Once an order enters <code>dock_processing</code> status, items undergo customized scaling and cutting. Orders cannot be cancelled or modified after dock processing has commenced.
                </p>
              </section>
            </>
          )}

          {/* REFUND & CANCELLATION */}
          {currentPolicy.id === 'refund' && (
            <>
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  1. Freshness Guarantee & Claims
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Due to the perishable nature of fresh coastal catches, physical returns are not permitted once delivery is completed. If you encounter any freshness or quality issue upon opening your pack, notify us within <strong>2 hours of receipt</strong> with photos sent to our official WhatsApp line (+91 93723 79317).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  2. Refund Resolution
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Approved claims will receive either an immediate replacement delivery during the next morning catch slot or a direct UPI/bank refund processed within 24 to 48 hours.
                </p>
              </section>
            </>
          )}

          {/* SHIPPING & DELIVERY */}
          {currentPolicy.id === 'shipping' && (
            <>
              <section className="space-y-3">
                <h2 className="text-base font-bold text-[#1D184D] uppercase tracking-wide">
                  1. Cold-Chain Delivery Slots
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  All catches are packed in insulated thermal ice trays for temperature management during delivery. Delivery is executed in designated windows:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-700">
                  <li><strong>Morning Catch Slot:</strong> 7:00 AM – 10:00 AM</li>
                  <li><strong>Evening Catch Slot:</strong> 4:00 PM – 7:00 PM</li>
                </ul>
              </section>
            </>
          )}

        </div>

      </main>
    </div>
  );
}
