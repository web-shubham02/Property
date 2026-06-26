import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { Clock, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SellerMessage() {
  const { user, profile, isMock } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(true);
  const [createdAt, setCreatedAt] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      
      try {
        if (isMock) {
          const allSubs = JSON.parse(localStorage.getItem('dharasetu_mock_seller_submissions') || '[]');
          const userSubs = allSubs.filter(s => s.user_id === user.id);
          if (userSubs.length > 0) {
            setStatus(userSubs[userSubs.length - 1].status || 'Pending');
            setCreatedAt(userSubs[userSubs.length - 1].created_at);
          } else {
            setStatus('Pending');
          }
        } else if (isSupabaseConfigured) {
          const { data, error } = await supabase
            .from('seller_land_submissions')
            .select('status, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (!error && data && data.length > 0) {
            setStatus(data[0].status || 'Pending');
            setCreatedAt(data[0].created_at);
          } else {
            setStatus('Pending');
          }
        }
      } catch (err) {
        console.error('Error fetching submission status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [user, isMock]);

  const getStatusBadge = (statusValue) => {
    const s = statusValue || 'Pending';
    switch (s.toLowerCase()) {
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-green-55 text-green-700 rounded-full border border-green-200" id="badge-status-converted">
            <CheckCircle size={14} /> Converted (Land Listed)
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-blue-55 text-blue-700 rounded-full border border-blue-200" id="badge-status-contacted">
            <Clock size={14} /> Agent Contacted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 bg-amber-55 text-amber-700 rounded-full border border-amber-200" id="badge-status-pending">
            <Clock size={14} /> Verification Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center font-sans px-4" id="page-seller-message">
      <div className="max-w-md w-full bg-white border border-gray-150 rounded-3xl p-8 shadow-lg text-center space-y-8">
        
        {/* Verification Icon Badge */}
        <div className="w-16 h-16 bg-brand/5 text-brand mx-auto rounded-full flex items-center justify-center">
          <ShieldCheck size={32} />
        </div>

        {/* Message */}
        {createdAt && (new Date() - new Date(createdAt)) > 24 * 60 * 60 * 1000 ? (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold font-outfit text-brand leading-tight">
              Contact Us Again
            </h1>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 text-left space-y-2">
              <p className="text-sm text-gray-700"><strong>Phone:</strong> <a href="tel:9934316418" className="text-brand hover:underline">9934316418</a></p>
              <p className="text-sm text-gray-700"><strong>Email:</strong> <a href="mailto:dharasetu01@gmail.com" className="text-brand hover:underline">dharasetu01@gmail.com</a></p>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed px-2">
              It has been more than 24 hours since your submission. Please reach out to us directly for immediate assistance.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h1 className="text-2xl font-extrabold font-outfit text-brand leading-tight">
              Our team will connect with you within 24 hours.
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed px-2">
              Thank you for registering as a land owner with DharaSetu. Our surveyor is currently reviewing your profile to schedule a boundary measurement callback.
            </p>
          </div>
        )}

        {/* Submission Status */}
        <div className="py-4 border-t border-b border-gray-150 flex flex-col items-center justify-center gap-2 bg-gray-50/50 rounded-2xl">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-muted">Submission Status</span>
          {getStatusBadge(status)}
        </div>

        {/* Action Button */}
        <button
          onClick={() => navigate('/properties')}
          id="btn-seller-browse-properties"
          className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          Browse Available Properties <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
