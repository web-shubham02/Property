import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc]">
      {/* Dynamic Navbar */}
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </main>
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
}
