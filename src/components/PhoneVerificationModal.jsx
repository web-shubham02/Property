import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isValidPhoneNumber } from '../supabaseClient';
import { Phone, AlertCircle, RefreshCw } from 'lucide-react';

export default function PhoneVerificationModal() {
  const { user, isMock, refreshProfile } = useAuth();
  const [phoneInput, setPhoneInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Prevent closing the modal via the Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = isValidPhoneNumber(phoneInput);
    if (!result.valid) {
      setError(result.reason);
      return;
    }

    setSubmitting(true);
    try {
      if (isMock) {
        // Mock Sandbox Update
        await new Promise((resolve) => setTimeout(resolve, 800));
        const savedMockProfile = localStorage.getItem('dharasetu_mock_profile');
        if (savedMockProfile) {
          const prof = JSON.parse(savedMockProfile);
          prof.phone = phoneInput;
          localStorage.setItem('dharasetu_mock_profile', JSON.stringify(prof));
        }
        await refreshProfile();
      } else {
        // Live Supabase Update
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ phone: phoneInput })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Reload user profile in context to close modal
        await refreshProfile();
      }
    } catch (err) {
      console.error('Error updating phone number:', err);
      setError(err.message || 'Failed to update phone number. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white border border-gray-150 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6 text-center animate-fade-in">
        
        {/* Decorative Circle and Icon */}
        <div className="mx-auto w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center border border-brand/10 shadow-inner">
          <Phone size={30} className="animate-pulse" />
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold font-outfit text-brand">Share Your Phone Number</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Please share your phone number so our team can connect with you.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs px-3.5 py-2.5 rounded-lg border border-red-200 flex items-start gap-2 text-left leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-400" size={16} />
            <input
              type="tel"
              required
              disabled={submitting}
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="e.g. 9876543210"
              autoComplete="tel"
              className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border border-gray-200 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !phoneInput.trim()}
            className="w-full bg-brand hover:bg-brand-dark text-white font-bold text-sm py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:bg-brand/50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Submit'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
