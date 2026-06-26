import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Phone, Mail, MapPin, Landmark, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const location = useLocation();

  const isPublicPage = ['/', '/about', '/services'].includes(location.pathname);
  const shouldBlur = !user && isPublicPage;

  return (
    <footer className="bg-brand text-white border-t border-brand-dark/20 font-sans" id="app-footer">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-col items-start mb-4">
              <div className="w-24 h-12 shrink-0 flex items-center justify-center -mb-3 -ml-2">
                <img src="/newlogo.png" alt="DharaSetu Logo" className="w-full h-full object-contain scale-[3] brightness-200" />
              </div>
              <div className="flex flex-col z-10">
                <span className="font-outfit font-extrabold text-3xl tracking-tight text-white leading-none">DharaSetu</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-brand-light/70 mt-1">Land Bridge</span>
              </div>
            </div>
            <p className="text-brand-light/75 text-sm max-w-sm leading-relaxed">
              Your trusted partner in land transactions. We provide a direct, secure bridge connecting land owners with prospective buyers, handling all aspects offline with premium brokerage.
            </p>
            <div className="flex gap-6 text-brand-light/90 pt-2">
              <div>
                <span className="block font-outfit font-bold text-lg text-white">5+ Years</span>
                <span className="text-xs text-brand-light/70">Experience</span>
              </div>
              <div className="border-l border-white/20 pl-6">
                <span className="block font-outfit font-bold text-lg text-white">95+ Projects</span>
                <span className="text-xs text-brand-light/70">Completed</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-outfit font-bold text-sm uppercase tracking-wider text-white">Navigation</h4>
            <ul className="space-y-2.5 text-sm text-brand-light/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  Home <ArrowUpRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors flex items-center gap-1">
                  About Us <ArrowUpRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors flex items-center gap-1">
                  Our Services <ArrowUpRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-white transition-colors flex items-center gap-1">
                  Browse Land <ArrowUpRight size={12} className="opacity-0 hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="font-outfit font-bold text-sm uppercase tracking-wider text-white">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-brand-light/80">
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="text-white/70 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs text-brand-light/50">Call/WhatsApp</span>
                  {shouldBlur ? (
                    <div className="flex flex-col">
                      <span className="font-semibold filter blur-[4px] select-none pointer-events-none">+91 9934316418</span>
                      <Link to="/signup" className="text-[10px] text-brand-light/70 hover:text-white underline font-bold mt-0.5">Sign up to contact us</Link>
                    </div>
                  ) : (
                    <a href="tel:9934316418" id="footer-link-phone" className="hover:text-white font-semibold transition-colors">+91 9934316418</a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="text-white/70 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs text-brand-light/50">Email Address</span>
                  {shouldBlur ? (
                    <div className="flex flex-col">
                      <span className="font-semibold filter blur-[4px] select-none pointer-events-none">dharasetu01@gmail.com</span>
                      <Link to="/signup" className="text-[10px] text-brand-light/70 hover:text-white underline font-bold mt-0.5">Sign up to contact us</Link>
                    </div>
                  ) : (
                    <a href="mailto:dharasetu01@gmail.com" id="footer-link-email" className="hover:text-white font-semibold transition-colors">dharasetu01@gmail.com</a>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-white/70 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-xs text-brand-light/50">Service Area</span>
                  <span className="font-semibold text-white/90">Premium plots, agricultural, and commercial lands</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-light/50 gap-4">
          <p>&copy; {currentYear} DharaSetu. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Premium Land Brokerage Services</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
