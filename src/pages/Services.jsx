import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Compass, Users, UserCheck, ShieldCheck, DollarSign, ArrowRight } from 'lucide-react';

export default function Services() {
  return (
    <div className="space-y-16 font-sans" id="page-services">
      {/* Page Header */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-muted bg-brand/5 px-4 py-1.5 rounded-full border border-brand/5">
          What We Offer
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-outfit text-brand">
          Tailored Land Services
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Whether you are looking to acquire prime plots for development or sell family-owned acreage, DharaSetu coordinates every detail securely and offline.
        </p>
      </section>

      {/* Services Grid (Buyers vs Sellers) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* For Buyers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
              <Compass size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-outfit text-brand tracking-tight">For Land Buyers</h2>
              <p className="text-xs text-gray-500 font-medium">Find and purchase pre-vetted, prime plots without broker runaround.</p>
            </div>
            
            <ul className="space-y-4 pt-2">
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Verified Inventory Only:</strong> Browse land with validated title deeds, clear road access, and survey markers already in place.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <DollarSign size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Transparent Price Metrics:</strong> No hidden middleman commissions. The listing prices match direct terms with clear breakdowns.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <UserCheck size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Direct Agent Support:</strong> Get physical site visits and full surveying assistance led by our lead broker Santosh Kumar.
                </div>
              </li>
            </ul>
          </div>


        </div>

        {/* For Sellers */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-outfit text-brand tracking-tight">For Land Owners (Sellers)</h2>
              <p className="text-xs text-gray-500 font-medium">Outsource the hassle of marketing, screening buyers, and closing paperwork.</p>
            </div>

            <ul className="space-y-4 pt-2">
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <ShieldCheck size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Agent Handover:</strong> We list your land as part of our exclusive inventory, matching the parcel with filtered buyers instantly.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <DollarSign size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Zero Upfront Marketing Costs:</strong> We absorb listing advertisements, digital assets, photography, and buyer lead-generation costs.
                </div>
              </li>
              <li className="flex gap-3 text-sm text-gray-600 leading-relaxed">
                <UserCheck size={18} className="text-brand shrink-0 mt-0.5" />
                <div>
                  <strong>Direct & Guaranteed Payouts:</strong> We coordinate all paperwork offline and match deals with vetted cash/bank loan buyers. You get paid once sold.
                </div>
              </li>
            </ul>
          </div>


        </div>
      </section>

      {/* FAQ Banner */}
      <section className="bg-brand-light/35 border border-brand-light rounded-3xl p-8 md:p-12 space-y-6">
        <h3 className="text-xl font-bold font-outfit text-brand text-center">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-brand">Are payments processed through the website?</h4>
            <p className="text-gray-500 leading-relaxed">No. We prioritize secure physical compliance. All transactions, earnest money transfers, and deed registries close physically at the sub-registrar office.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-brand font-bold text-brand">What details do I need to sell my land?</h4>
            <p className="text-gray-500 leading-relaxed">You only need to register and indicate you want to sell. Our agent will call you to collect survey sketches, registry titles, and tax receipts before Listing.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
