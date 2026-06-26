import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ProtectedRoute, AgentRoute } from './components/Guards';

// Import Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SellerMessage from './pages/SellerMessage';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import ResetPassword from './pages/ResetPassword';

// Import Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentProperties from './pages/agent/AgentProperties';
import AgentBuyers from './pages/agent/AgentBuyers';
import AgentSellers from './pages/agent/AgentSellers';

function OAuthRedirectHandler() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && (window.location.hash.includes('access_token=') || window.location.href.includes('access_token='))) {
      navigate('/properties', { replace: true });
    }
  }, [user, navigate]);

  return null;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <OAuthRedirectHandler />
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Client Protected Routes */}
            <Route 
              path="/properties" 
              element={
                <ProtectedRoute>
                  <Properties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/properties/:id" 
              element={
                <ProtectedRoute>
                  <PropertyDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller-message" 
              element={
                <ProtectedRoute>
                  <SellerMessage />
                </ProtectedRoute>
              } 
            />

            {/* Agent Protected Routes (Admin Panel) */}
            <Route 
              path="/agent/dashboard" 
              element={
                <AgentRoute>
                  <AgentDashboard />
                </AgentRoute>
              } 
            />
            <Route 
              path="/agent/properties" 
              element={
                <AgentRoute>
                  <AgentProperties />
                </AgentRoute>
              } 
            />
            <Route 
              path="/agent/buyers" 
              element={
                <AgentRoute>
                  <AgentBuyers />
                </AgentRoute>
              } 
            />
            <Route 
              path="/agent/sellers" 
              element={
                <AgentRoute>
                  <AgentSellers />
                </AgentRoute>
              } 
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
