import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, isValidPhoneNumber } from '../supabaseClient';
import { MapPin, Maximize, X } from 'lucide-react';

export default function SellLandModal({ isOpen, onClose }) {
  const { user, profile, isMock } = useAuth();
  const navigate = useNavigate();

  const [location, setLocation] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location.trim() || !size.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const result = isValidPhoneNumber(profile?.phone || '');
    if (!result.valid) {
      setError(result.reason);
      return;
    }

    setLoading(true);
    try {
      if (isMock) {
        // Save initial land submission lead in mock
        const submissions = JSON.parse(localStorage.getItem('dharasetu_mock_seller_submissions') || '[]');
        submissions.push({
          id: 'sub-' + Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          location: location,
          size: size,
          status: 'Pending',
          created_at: new Date().toISOString()
        });
        localStorage.setItem('dharasetu_mock_seller_submissions', JSON.stringify(submissions));
      } else {
        const { error: submissionError } = await supabase
          .from('seller_land_submissions')
          .upsert(
            {
              user_id: user.id,
              name: profile?.full_name || '',
              phone: profile?.phone || '',
              location: location,
              size: size,
              status: 'Pending'
            },
            { onConflict: 'user_id' }
          );

        if (submissionError) throw submissionError;
      }
      
      onClose();
      navigate('/seller-message');
    } catch (err) {
      console.error('Error submitting land details:', err);
      setError(err.message || 'Failed to submit land details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="bg-white border border-gray-150 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-brand text-white p-5 flex items-center justify-between">
          <h2 className="font-outfit font-bold text-lg">Sell Your Land</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Readonly Info */}
          <div className="space-y-3 p-3 bg-gray-50 border border-gray-100 rounded-xl mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Name</span>
              <span className="font-semibold text-gray-800">{profile?.full_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 font-medium">Phone</span>
              <span className="font-semibold text-gray-800">{profile?.phone}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand uppercase tracking-wider block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Near highway, District"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-brand uppercase tracking-wider block">Size</label>
            <div className="relative">
              <Maximize className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 2 acres"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Submit Details'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
