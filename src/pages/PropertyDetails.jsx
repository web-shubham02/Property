import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { mockProperties, formatPrice } from '../data/mockProperties';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, AreaChart, PhoneCall, Mail, Play, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Load property details
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

          if (!error && data) {
            setProperty(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading property from Supabase, looking in local inventory:', err);
      }

      // Mock Mode fallback
      const localProps = JSON.parse(localStorage.getItem('dharasetu_properties') || '[]');
      const prop = localProps.find(p => p.id === id) || mockProperties.find(p => p.id === id);
      
      if (prop) {
        setProperty(prop);
      }
      setLoading(false);
    };

    fetchProperty();
  }, [id]);

  // Extract YouTube Embed URL helper
  const getEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = '';
    
    try {
      if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
    } catch (e) {
      console.error('Error parsing video URL:', e);
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Sold':
        return <span className="px-3.5 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-full border border-gray-250">Sold</span>;
      case 'On Hold':
        return <span className="px-3.5 py-1.5 text-xs font-bold bg-amber-50 text-amber-600 rounded-full border border-amber-200">On Hold</span>;
      default:
        return <span className="px-3.5 py-1.5 text-xs font-bold bg-green-50 text-green-700 rounded-full border border-green-250">Available</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 max-w-md mx-auto text-center font-sans">
        <ShieldAlert className="text-brand-muted w-12 h-12" />
        <h2 className="text-2xl font-extrabold font-outfit text-brand">Property Not Found</h2>
        <p className="text-xs text-gray-500">
          The property listing you are trying to view does not exist or has been removed from our active databases.
        </p>
        <Link 
          to="/properties" 
          className="bg-brand hover:bg-brand-dark text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors"
        >
          Return to Browse
        </Link>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(property.video_url);

  return (
    <div className="space-y-10 font-sans" id="page-property-detail-view">
      
      {/* Back Button Link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs font-bold text-brand hover:text-brand-dark transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Listings
        </button>
      </div>

      {/* Main Grid: Gallery vs Info panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Media Gallery & Description */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Photos Container */}
          <div className="space-y-3">
            {/* Active Display */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-150 shadow-sm">
              <img
                src={property.photos?.[activePhotoIdx] || '/plot_residential.png'}
                alt={property.title}
                className="w-full h-full object-cover animate-fadeIn"
              />
              <div className="absolute top-4 left-4 bg-brand text-white font-extrabold font-outfit text-sm px-4.5 py-2 rounded-full shadow-md">
                {formatPrice(property.price)}
              </div>
            </div>

            {/* Thumbnails list */}
            {property.photos && property.photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {property.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-20 aspect-[4/3] rounded-lg overflow-hidden border shrink-0 transition-all ${
                      activePhotoIdx === idx 
                        ? 'border-brand ring-2 ring-brand/10 translate-y-[-2px]' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Overview Details */}
          <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-2 border-b border-gray-100 pb-5">
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge(property.status)}
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  Listed {new Date(property.created_at || new Date()).toLocaleDateString('en-IN', {month: 'long', year: 'numeric'})}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-brand leading-tight" id="property-detail-title">
                {property.title}
              </h1>
              <div className="flex flex-col sm:flex-row gap-4 pt-1 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-brand/85 shrink-0" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AreaChart size={14} className="text-brand/85 shrink-0" />
                  <span>Sizing Area: {property.size}</span>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-3">
              <h3 className="font-outfit font-bold text-brand uppercase text-xs tracking-wider">Land Overview</h3>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* Video Player Section */}
          {embedUrl && (
            <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-outfit font-bold text-brand uppercase text-xs tracking-wider flex items-center gap-1">
                <Play size={14} className="text-brand" /> Walkthrough Land Video
              </h3>
              <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-100 bg-black">
                <iframe
                  title="Land Video Walkthrough"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Contact Broker Console */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          
          {/* Contact agent box */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-md space-y-6">
            
            {/* Header info */}
            <div className="text-center pb-5 border-b border-gray-100 space-y-3">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-muted">Lead Sourcing Broker</span>
              
              <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-brand/10 mx-auto shadow-sm">
                <img 
                  src="/santosh_kumar.jpg" 
                  alt="Broker Santosh Kumar"
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div>
                <h4 className="font-outfit font-bold text-base text-brand">Santosh Kumar</h4>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">DharaSetu Real Estate Agent</p>
              </div>
            </div>

            {/* Core details list */}
            <div className="space-y-4 text-xs font-semibold relative group">
              {!user ? (
                <>
                  <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-brand-dark text-white text-[10px] py-1.5 px-3 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold z-30">
                    Sign up to contact agent
                  </span>
                  <div className="space-y-4">
                    <span
                      className="w-full bg-brand/50 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm text-xs font-bold filter blur-[2px] select-none pointer-events-none"
                    >
                      <PhoneCall size={14} /> Call Agent Now
                    </span>
                    <span
                      className="w-full bg-brand-light/50 text-brand/50 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold border border-brand/5 filter blur-[2px] select-none pointer-events-none"
                    >
                      <Mail size={14} /> Email Agent Now
                    </span>
                  </div>
                  <div className="text-center pt-2">
                    <Link 
                      to="/signup"
                      className="text-xs font-bold text-brand hover:text-brand-dark underline transition-colors"
                    >
                      Sign up to contact agent
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Call Agent */}
                  <a
                    href="tel:9934316418"
                    id="btn-detail-call"
                    className="w-full bg-brand hover:bg-brand-dark text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors text-xs font-bold"
                  >
                    <PhoneCall size={14} /> Call Agent Now
                  </a>

                  {/* Email Agent */}
                  <a
                    href="mailto:dharasetu01@gmail.com"
                    id="btn-detail-email"
                    className="w-full bg-brand-light text-brand hover:bg-brand hover:text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-bold border border-brand/5"
                  >
                    <Mail size={14} /> Email Agent Now
                  </a>
                </>
              )}
            </div>

            {/* Offline notification card */}
            <div className="bg-amber-50/50 border border-amber-250 p-4.5 rounded-xl text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-amber-800 font-outfit font-bold text-xs uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Offline Closing Portal</span>
              </div>
              <p className="text-[10.5px] text-amber-700/80 leading-normal">
                To guarantee title verification, this listing closes physically. Call or email the broker above to book site visits, inspect deeds, or place deposits.
              </p>
            </div>

          </div>

          {/* Quick Stats Sidebar */}
          <div className="bg-brand-light/35 border border-brand-light p-6 rounded-2xl space-y-4">
            <h4 className="font-outfit font-bold text-xs text-brand uppercase tracking-wider">DharaSetu Service Assurances</h4>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex gap-2">
                <span className="text-brand select-none font-bold">✓</span>
                <span>Fully clear boundaries and physical layout pre-vetted.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand select-none font-bold">✓</span>
                <span>Original legal title deed inspectable on appointment.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand select-none font-bold">✓</span>
                <span>Registrar compliance coordinating support included.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
