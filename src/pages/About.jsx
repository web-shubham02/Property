import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Award, Phone, Mail } from 'lucide-react';

export default function About() {
  const { user } = useAuth();
  return (
    <div className="space-y-16 font-sans" id="page-about">
      {/* Header Banner */}
      <section className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-muted bg-brand/5 px-4 py-1.5 rounded-full border border-brand/5">
          Our Philosophy
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-outfit text-brand leading-tight">
          Bridging Land Owners & Buyers with Integrity
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Founded on trust and local expertise, DharaSetu represents land listings transparently, handling all details offline to assure clean, secure transactions.
        </p>
      </section>

      {/* Story & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Story Text */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-2xl font-bold font-outfit text-brand tracking-tight">The DharaSetu Story</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            In Sanskrit, <strong>Dhara</strong> means Land, and <strong>Setu</strong> means Bridge. True to our name, we act as a secure, legally-sound bridge between land owners (sellers) and buyers.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            The traditional land market is often plagued by opaque pricing, multiple middle-men, and complex documentation. DharaSetu was established to simplify this. We work directly with sellers to take over their land parcels as inventory, run extensive background checks, and list them directly to buyers on fair terms.
          </p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Since our transactions close completely offline, we maintain physical connection and personal guidance throughout the registry process. We handle all documentation and legalities, ensuring peace of mind for both parties.
          </p>
        </div>

        {/* Highlight Stats Cards */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-2">
            <Award className="text-brand w-8 h-8" />
            <h3 className="font-outfit font-extrabold text-3xl text-brand">5+ Years</h3>
            <p className="text-xs uppercase font-bold tracking-wider text-brand-muted">Brokerage Experience</p>
            <p className="text-xs text-gray-400 mt-2">Guiding clients safely through the complex land acquisition landscapes.</p>
          </div>
          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-2">
            <Shield className="text-brand w-8 h-8" />
            <h3 className="font-outfit font-extrabold text-3xl text-brand">95+ Projects</h3>
            <p className="text-xs uppercase font-bold tracking-wider text-brand-muted">Completed Deals</p>
            <p className="text-xs text-gray-400 mt-2">Successfully closed residential plots, farmland transactions, and commercial sales.</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-brand-light/35 border border-brand-light rounded-3xl p-8 md:p-12 space-y-8">
        <h2 className="text-2xl font-extrabold text-center font-outfit text-brand">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-sm text-brand">Absolute Transparency</h4>
            <p className="text-xs text-gray-500 leading-relaxed">No hidden brokerage, no surprise listing modifications. The pricing you see is exact and final.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-sm text-brand">Rigorous Verification</h4>
            <p className="text-xs text-gray-500 leading-relaxed">Every land plot undergoes vetting for boundary metrics, title deeds, land approvals, and road access beforehand.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-brand/10 text-brand rounded-lg flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-sm text-brand">End-to-End Support</h4>
            <p className="text-xs text-gray-500 leading-relaxed">From initial site visits to drafting documentation and local registrar office support, we walk with you.</p>
          </div>
        </div>
      </section>

      {/* Agent Profile Section */}
      <section className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm space-y-8">
        <div className="max-w-xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-muted">Your Trusted Land Advisor</span>
          <h2 className="text-3xl font-extrabold font-outfit text-brand">Meet the Agent</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Agent Portrait Image */}
          <div className="md:col-span-4 max-w-[280px] mx-auto md:mx-0 rounded-2xl overflow-hidden shadow-md border border-gray-100 shrink-0 aspect-[1/1]">
            <img 
              src="/santosh_kumar.jpg" 
              alt="Lead Agent Santosh Kumar"
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Bio & Details */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-outfit text-brand">Santosh Kumar</h3>
              <p className="text-xs uppercase font-extrabold tracking-widest text-brand-muted">Lead Broker & Surveyor</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              With over 5 years of dedicated experience in the regional land markets, Santosh has earned a reputation for reliability, thorough legal checks, and fair negotiations. He coordinates directly with local developers, farmland owners, and surveyors to source clean, high-potential inventory.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              <em>"At DharaSetu, we do not view land as merely an asset class. It is the foundation of homes, agricultural sustenance, and business expansion. We make sure that foundation is clean, secure, and legally flawless."</em>
            </p>
            
            {/* Quick Contacts */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-semibold pt-2">
              {!user ? (
                <div className="relative group flex flex-col sm:flex-row items-center gap-4">
                  <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-brand-dark text-white text-[10px] py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-30">
                    Sign up to contact us
                  </span>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-2 text-brand px-4 py-2.5 rounded-lg bg-brand-light filter blur-[4px] select-none pointer-events-none">
                        <Phone size={14} /> Call: +91 9934316418
                      </span>
                      <span className="flex items-center gap-2 text-brand px-4 py-2.5 rounded-lg bg-brand-light filter blur-[4px] select-none pointer-events-none">
                        <Mail size={14} /> Email: dharasetu01@gmail.com
                      </span>
                    </div>
                    <Link 
                      to="/signup"
                      className="text-xs font-bold text-brand hover:text-brand-dark underline transition-colors"
                    >
                      Sign up to contact us
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <a 
                    href="tel:9934316418" 
                    className="flex items-center gap-2 text-brand hover:text-brand-dark transition-colors px-4 py-2.5 rounded-lg bg-brand-light"
                  >
                    <Phone size={14} /> Call: +91 9934316418
                  </a>
                  <a 
                    href="mailto:dharasetu01@gmail.com" 
                    className="flex items-center gap-2 text-brand hover:text-brand-dark transition-colors px-4 py-2.5 rounded-lg bg-brand-light"
                  >
                    <Mail size={14} /> Email: dharasetu01@gmail.com
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
