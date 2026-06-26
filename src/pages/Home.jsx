import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { mockProperties, formatPrice } from '../data/mockProperties';
import { ArrowRight, MapPin, AreaChart, ShieldCheck, PhoneCall, FileText } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('status', 'Available')
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (!error && data && data.length > 0) {
            setProperties(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading properties from Supabase, loading fallback:', err);
      }
      
      // Fallback
      setProperties(mockProperties.filter(p => p.status === 'Available').slice(0, 3));
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 font-sans" id="page-home">
      {/* Hero Section */}
      <section className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[500px] md:h-[600px] flex items-center justify-center text-white px-6">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover transition-transform duration-10000 transform scale-105 hover:scale-100"
            src="/hero_video.mp4"
            poster="/hero_bg.png"
          />
        </div>
        {/* Neutral Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative max-w-3xl text-center space-y-6 z-10">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-brand-light bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
            DharaSetu Real Estate
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight font-outfit" id="hero-headline">
            Your Bridge to the <br />Right Land
          </h1>
          <p className="text-brand-light/90 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed">
            We list verified residential, commercial, and agricultural land in prime locations. All deals closed offline with complete transparency and trust.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/properties"
              id="btn-hero-browse"
              className="bg-white text-brand hover:bg-brand-light font-bold text-sm px-7 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Browse Properties
            </Link>
            <Link
              to="/signup"
              id="btn-hero-sell"
              className="bg-brand-dark/25 hover:bg-white/15 text-white font-bold text-sm px-7 py-3.5 rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-200"
            >
              Sell Your Land
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar Section */}
      <section className="-mt-10 max-w-5xl mx-auto relative z-20">
        <div className="glass shadow-xl rounded-xl md:rounded-2xl py-6 px-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="text-center md:px-4 py-2 md:py-0">
            <span className="block font-outfit font-extrabold text-3xl text-brand">5+ Years</span>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-muted mt-1 block">Experience</span>
          </div>
          <div className="text-center md:px-4 py-4 md:py-0">
            <span className="block font-outfit font-extrabold text-3xl text-brand">95+ Projects</span>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-muted mt-1 block">Completed</span>
          </div>
          <div className="text-center md:px-4 py-2 md:py-0">
            <span className="block font-outfit font-extrabold text-3xl text-brand">100% Offline</span>
            <span className="text-xs uppercase font-bold tracking-widest text-brand-muted mt-1 block">Trusted Deals</span>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-brand-muted">Premium Handpicked Lands</span>
            <h2 className="text-3xl font-extrabold tracking-tight font-outfit text-brand">Featured Properties</h2>
          </div>
          <Link 
            to="/properties" 
            className="flex items-center gap-1.5 font-bold text-brand hover:text-brand-dark transition-colors text-sm hover:translate-x-1 duration-200"
          >
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-[380px] border border-gray-150 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {properties.map((property) => (
              <div 
                key={property.id} 
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-brand/10 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 shrink-0">
                  <img 
                    src={property.photos?.[0] || '/plot_residential.png'} 
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-brand text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                    {formatPrice(property.price)}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-outfit font-extrabold text-lg text-brand leading-snug line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-500 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-brand/75 shrink-0" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <AreaChart size={14} className="text-brand/75 shrink-0" />
                        <span>Size: {property.size}</span>
                      </div>
                    </div>
                  </div>

                  <Link 
                    to={`/properties/${property.id}`}
                    className="w-full text-center bg-brand-light text-brand group-hover:bg-brand group-hover:text-white font-bold text-xs py-3 rounded-lg transition-all duration-200 block shadow-sm border border-brand/5"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-brand-light/35 rounded-2xl p-8 md:p-12 space-y-12 border border-brand-light">
        <div className="text-center max-w-md mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-muted">Simple & Transparent</span>
          <h2 className="text-3xl font-extrabold tracking-tight font-outfit text-brand">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* For Buyers */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-outfit text-brand border-b border-brand-light pb-3 flex items-center gap-2">
              <ShieldCheck className="text-brand shrink-0" />
              For Land Buyers
            </h3>
            <ol className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Browse Verified Inventory</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Search through our exclusive selection of verified residential, commercial, and agricultural plots.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Contact Agent Directly</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Call or email our dedicated agent to ask questions, request paperwork, or schedule a site visit.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Close Deal Offline</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sign documentation and execute transactions offline under secure legal guidance with zero online portals.</p>
                </div>
              </li>
            </ol>
          </div>

          {/* For Sellers */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold font-outfit text-brand border-b border-brand-light pb-3 flex items-center gap-2">
              <FileText className="text-brand shrink-0" />
              For Land Owners
            </h3>
            <ol className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Submit Land Details</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Register as a seller and supply details about your property size, location, and desired price.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Agent Verification</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Our lead agent reviews the listing, performs site inspections, and absorbs it into our inventory.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-bold text-sm text-brand">Get Paid on Sale</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">We handle marketing, buyer calls, and documentation. You get paid directly once the sale closes.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* CTA Footer-bridge */}
      <section className="relative rounded-2xl overflow-hidden py-12 px-8 bg-brand text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-brand/10">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-extrabold font-outfit">Ready to find your ideal land plot?</h3>
          <p className="text-brand-light/75 text-sm">Join our platform today or talk directly to our lead land agent.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          {!user ? (
            <div className="relative group flex flex-col items-center">
              <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-brand-dark text-white text-[10px] py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-30">
                Sign up to contact us
              </span>
              <div className="flex gap-2 items-center">
                <Link 
                  to="/signup"
                  className="flex items-center gap-1.5 bg-white text-brand px-5 py-3 rounded-lg font-bold text-xs shadow-md select-none filter blur-[4px] pointer-events-none"
                  tabIndex="-1"
                >
                  <PhoneCall size={14} /> Call Agent
                </Link>
                <Link 
                  to="/signup"
                  className="text-xs font-bold text-brand-light hover:text-white underline transition-colors"
                >
                  Sign up to contact us
                </Link>
              </div>
            </div>
          ) : (
            <a 
              href="tel:9934316418" 
              className="flex items-center gap-1.5 bg-white text-brand hover:bg-brand-light px-5 py-3 rounded-lg font-bold text-xs shadow-md transition-all animate-pulse"
            >
              <PhoneCall size={14} /> Call Agent
            </a>
          )}
          
          {!user && (
            <Link 
              to="/signup" 
              className="bg-brand-dark/30 hover:bg-white/10 px-5 py-3 rounded-lg font-bold text-xs border border-white/20 transition-all"
            >
              Create Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
