import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, FileText, Truck, RotateCcw, Mail, MessageCircle, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'shipping' | 'returns';

interface LegalPolicyPageProps {
  initialTab?: PolicyTab;
}

export function LegalPolicyPage({ initialTab }: LegalPolicyPageProps) {
  const location = useLocation();

  const getTabFromPath = (): PolicyTab => {
    if (initialTab) return initialTab;
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('shipping')) return 'shipping';
    if (path.includes('return') || path.includes('refund')) return 'returns';
    return 'terms';
  };

  const [activeTab, setActiveTab] = React.useState<PolicyTab>(getTabFromPath());

  React.useEffect(() => {
    setActiveTab(getTabFromPath());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, initialTab]);

  const tabs: { id: PolicyTab; label: string; icon: React.ElementType; path: string }[] = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText, path: '/terms' },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, path: '/privacy' },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck, path: '/shipping-policy' },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw, path: '/returns-refunds' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0D1220] pt-24 pb-20 px-4 sm:px-6 lg:px-8 selection:bg-[#E87535]/20 selection:text-[#E87535]">
      <div className="max-w-4xl mx-auto">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8C93A4] mb-4 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#E87535] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#0D1220]">Legal & Store Policies</span>
        </div>

        {/* Hero Section */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E87535]/10 text-[#E87535] text-xs font-bold uppercase tracking-widest mb-3">
            <ShieldCheck size={14} /> Trust & Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-[#0D1220]">
            Customer Policies & Terms
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#5B6478] max-w-2xl leading-relaxed">
            Clear, honest, and customer-first guidelines designed to protect your privacy, guarantee secure transactions, and ensure hassle-free doorstep shopping across India.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-[#F0EEE6] rounded-2xl mb-10 border border-[#E5E1D5]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                  isActive
                    ? 'bg-[#141414] text-white shadow-md'
                    : 'text-[#5B6478] hover:text-[#0D1220] hover:bg-white/60'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#E87535]' : 'text-current'} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tab Content Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE7DC] shadow-sm">
          {/* ================= 1. TERMS OF SERVICE ================= */}
          {activeTab === 'terms' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#F0EEE6] pb-6">
                <span className="text-xs font-bold text-[#E87535] uppercase tracking-wider">Effective: November 2026</span>
                <h2 className="text-2xl font-black text-[#0D1220] mt-1 font-display">Terms and Conditions of Use</h2>
                <p className="text-xs text-[#8C93A4] mt-1">Applicable to all orders and browsing activity on Funky Fox Menswear.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 1. Platform Ownership & Commercial Identity
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  This website and brand (<strong>Funky Fox</strong> / <strong>Funky Fox Menswear</strong>) is dedicated to premium casual and lifestyle menswear, operating under Indian trade and commercial guidelines. By browsing the site, placing an order, or registering an account, you unconditionally agree to these Terms.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 2. Pricing, Currencies & Applicable Taxes
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  All catalog prices are listed in <strong>Indian Rupees (INR ₹)</strong> and include all applicable Good and Services Tax (GST) as mandated by Indian Law. We reserve the right to revise catalog pricing, promotional offers, or shipping rates at our discretion prior to order placement.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 3. Payment Processing & Verification
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Online payments are processed through <strong>Cashfree Payments</strong>, a Reserve Bank of India (RBI) authorized payment aggregator certified to PCI-DSS Level 1 security standards. We accept UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking, Credit Cards, Debit Cards, and Cash on Delivery (where eligible).
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 4. Order Confirmation & Fulfillment
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Upon completing checkout, an automated confirmation with an authoritative order reference (e.g. <code>FF-XXXXXX</code>) is issued. Funky Fox reserves the right to decline or cancel orders in cases of stock discrepancies, inaccurate delivery addresses, or suspected fraudulent activity, with full refund issued immediately.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 5. Intellectual Property & Brand Rights
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  All imagery, brand logos, product descriptions, photography, design elements, and website code are the exclusive intellectual property of Funky Fox Menswear. Unauthorized reproduction, modification, or commercial misuse is strictly prohibited under Indian copyright and trademark statutes.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 6. Dispute Resolution & Jurisdiction
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Any disputes arising from transactions or platform usage shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in <strong>Telangana, India</strong>.
                </p>
              </section>
            </div>
          )}

          {/* ================= 2. PRIVACY POLICY ================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#F0EEE6] pb-6">
                <span className="text-xs font-bold text-[#E87535] uppercase tracking-wider">DPDP & IT Act 2000 Compliant</span>
                <h2 className="text-2xl font-black text-[#0D1220] mt-1 font-display">Customer Privacy Policy</h2>
                <p className="text-xs text-[#8C93A4] mt-1">How Funky Fox protects, manages, and respects your personal data.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 1. Information We Collect
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  To provide accurate doorstep delivery and order communication, we collect:
                </p>
                <ul className="list-disc pl-5 text-sm text-[#5B6478] space-y-1">
                  <li><strong>Contact Details</strong>: Customer full name, email address, phone number.</li>
                  <li><strong>Delivery Address</strong>: Street address, flat/door number, landmark, city, state, and pincode.</li>
                  <li><strong>Transaction Records</strong>: Order numbers, items purchased, totals, and Cashfree payment confirmation references.</li>
                  <li><strong>Technical Telemetry</strong>: IP address, device type, and session tokens strictly used for security, anti-fraud checks, and cart persistence.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 2. Zero Financial Data Storage Guarantee
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-950 text-xs sm:text-sm leading-relaxed">
                  <strong>Your Card & UPI Security:</strong> Funky Fox <em>never</em> sees, processes, or stores your Credit/Debit Card numbers, CVV codes, UPI PINs, or netbanking passwords. All payment transactions occur inside the RBI-compliant encrypted environment of Cashfree Payments.
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 3. How We Use Your Data
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Your data is used solely to fulfill your orders, provide dispatch tracking updates via SMS / WhatsApp / Email, process customer care queries, and improve your shopping experience. We <strong>never sell, rent, or trade</strong> your personal information to third-party data brokers.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 4. Trusted Delivery Partners
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  We share your delivery address and phone number exclusively with licensed logistics partners (e.g., Shiprocket, Delhivery, Blue Dart) strictly for delivery routing and delivery verification OTPs.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 5. Data Deletion & Grievance Officer
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Under the Digital Personal Data Protection Act, you may request data deletion or update your profile at any time. For privacy inquiries or grievances, contact our designated officer:
                </p>
                <div className="p-4 rounded-xl bg-[#F0EEE6] text-xs space-y-1 font-mono text-[#0D1220]">
                  <p><strong>Grievance Desk</strong>: Customer Care, Funky Fox Menswear</p>
                  <p><strong>Email</strong>: info@funkyfoxmenswear.com</p>
                  <p><strong>Response SLA</strong>: Within 48 business hours</p>
                </div>
              </section>
            </div>
          )}

          {/* ================= 3. SHIPPING POLICY ================= */}
          {activeTab === 'shipping' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#F0EEE6] pb-6">
                <span className="text-xs font-bold text-[#E87535] uppercase tracking-wider">Fast & Tracked Pan-India Delivery</span>
                <h2 className="text-2xl font-black text-[#0D1220] mt-1 font-display">Shipping & Delivery Policy</h2>
                <p className="text-xs text-[#8C93A4] mt-1">Timelines, delivery charges, and packaging standards.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 1. Shipping Rates & Free Delivery
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F0EEE6] border border-[#E5E1D5]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E87535]">Orders ₹1,499 & Above</span>
                    <p className="text-xl font-black text-[#0D1220] mt-1 font-display">FREE SHIPPING</p>
                    <p className="text-xs text-[#5B6478] mt-1">Zero delivery fee applied automatically at checkout across all Indian pincodes.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#F0EEE6] border border-[#E5E1D5]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C93A4]">Orders Below ₹1,499</span>
                    <p className="text-xl font-black text-[#0D1220] mt-1 font-display">₹99 FLAT FEE</p>
                    <p className="text-xs text-[#5B6478] mt-1">Covers secure, tracked door-to-door express parcel delivery.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 2. Processing & Dispatch Timelines
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  All orders are verified and dispatched from our fulfillment center within <strong>24 to 48 business hours</strong> (excluding national holidays and Sundays). Orders placed before 12:00 PM are prioritized for same-day packing.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 3. Estimated Delivery Times
                </h3>
                <ul className="list-disc pl-5 text-sm text-[#5B6478] space-y-1">
                  <li><strong>Metro Cities (Hyderabad, Bengaluru, Mumbai, Delhi-NCR, Chennai, Kolkata)</strong>: 2 to 4 business days.</li>
                  <li><strong>Tier-2 & Tier-3 Cities</strong>: 3 to 5 business days.</li>
                  <li><strong>Special/Remote Regions (North East, J&K, Island territories)</strong>: 5 to 7 business days.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 4. Live Tracking Notifications
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  As soon as your package is handed to the courier partner, an automated dispatch notification containing your <strong>AWB Tracking Number</strong> and direct tracking URL is sent via SMS, WhatsApp, and Email.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" /> 5. Tamper-Proof Packaging Warning
                </h3>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed">
                  Every Funky Fox garment is packed in sealed, branded tamper-evident packaging. <strong>Do NOT accept any parcel that appears torn, opened, or tampered with.</strong> Report any package issue within 24 hours to our support desk.
                </div>
              </section>
            </div>
          )}

          {/* ================= 4. RETURNS & REFUNDS ================= */}
          {activeTab === 'returns' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="border-b border-[#F0EEE6] pb-6">
                <span className="text-xs font-bold text-[#E87535] uppercase tracking-wider">7-Day Customer Happiness Guarantee</span>
                <h2 className="text-2xl font-black text-[#0D1220] mt-1 font-display">Returns, Exchanges & Refund Policy</h2>
                <p className="text-xs text-[#8C93A4] mt-1">Easy sizing swaps and guaranteed refunds.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 1. The 7-Day Exchange & Return Window
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  We want you to love your fit. If a size doesn't suit you or you wish to return an item, you may request an exchange or return within <strong>7 calendar days</strong> from the date of recorded delivery.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 2. Eligibility & Quality Conditions
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  To qualify for an exchange or return, items must meet the following criteria:
                </p>
                <ul className="list-disc pl-5 text-sm text-[#5B6478] space-y-1">
                  <li>Garment must be <strong>unworn, unwashed, and undamaged</strong> with zero perfume, deodorant, or makeup stains.</li>
                  <li>All original brand tags, neck tags, and wash-care labels must remain firmly attached.</li>
                  <li>Product must be returned in its original polybag/packaging.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 3. Free Size Exchanges
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Ordered a Medium and need a Large? Your <strong>first size exchange per order is completely free</strong>. Our courier partner will pick up the current piece and hand over the replacement size once inspected.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#E87535]" /> 4. Refund Methods & Timelines
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Once our quality audit team receives and approves the returned garment:
                </p>
                <ul className="list-disc pl-5 text-sm text-[#5B6478] space-y-1">
                  <li><strong>Prepaid Orders (UPI / Cards / NetBanking)</strong>: Refund is issued directly back to your original source account within <strong>5 to 7 banking days</strong> via Cashfree Payments.</li>
                  <li><strong>Cash on Delivery (COD)</strong>: A verified bank transfer (NEFT / IMPS) or instant UPI transfer is dispatched upon receiving your UPI ID / account details.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#E87535]" /> 5. Non-Returnable Items
                </h3>
                <p className="text-sm text-[#5B6478] leading-relaxed">
                  Due to strict personal hygiene standards, items classified as <strong>Innerwear, Undergarments, or Socks</strong> are non-returnable unless received with a verified manufacturing defect.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-[#0D1220] flex items-center gap-2">
                  <MessageCircle size={16} className="text-[#E87535]" /> 6. How to Initiate a Return or Exchange
                </h3>
                <div className="p-5 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D5] space-y-3">
                  <p className="text-xs sm:text-sm text-[#5B6478]">
                    You can initiate an instant return or exchange by choosing either of the two fastest methods:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/919493551595?text=Hi%20Funky%20Fox%2C%20I%20would%20like%20to%20request%20an%20exchange%2Freturn%20for%20my%20order"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1EBE5D] transition-all shadow-sm"
                    >
                      <MessageCircle size={16} /> WhatsApp Support Desk
                    </a>
                    <a
                      href="mailto:info@funkyfoxmenswear.com?subject=Return%2FExchange%20Request"
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#141414] text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-sm"
                    >
                      <Mail size={16} /> Email Help Desk
                    </a>
                  </div>
                  <p className="text-[11px] text-[#8C93A4]">
                    Please mention your Order Number (e.g. <code>FF-XXXXXX</code>) and reason for return.
                  </p>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Bottom Help Desk Banner */}
        <div className="mt-8 p-6 rounded-3xl bg-[#141414] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-white">Have questions about an order or policy?</h4>
            <p className="text-xs text-white/70 mt-0.5">Our support team is available Monday to Saturday, 10 AM to 7 PM IST.</p>
          </div>
          <a
            href="mailto:info@funkyfoxmenswear.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E87535] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#d06427] transition-all shrink-0"
          >
            <Mail size={14} /> info@funkyfoxmenswear.com
          </a>
        </div>
      </div>
    </div>
  );
}
