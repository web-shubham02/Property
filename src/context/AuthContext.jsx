import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, getRedirectUrl } from '../supabaseClient';

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  isMock: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  resendVerificationEmail: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(!isSupabaseConfigured);
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Load mock data from localStorage if in mock mode
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsMock(true);
      const savedMockUser = localStorage.getItem('dharasetu_mock_user');
      const savedMockProfile = localStorage.getItem('dharasetu_mock_profile');
      
      if (savedMockUser && savedMockProfile) {
        setUser(JSON.parse(savedMockUser));
        setProfile(JSON.parse(savedMockProfile));
      }
      setLoading(false);
      return;
    }

    setIsMock(false);
    
    // Live Supabase Auth Setup
    const ensureProfileExists = async (sessionUser) => {
      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', sessionUser.id)
          .maybeSingle();

        if (!existingProfile) {
          // Re-fetch user to get latest metadata reliably as requested
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
              email: user.email,
              phone: user.user_metadata?.phone || '',
              is_agent: false
            });
          }
        }
      } catch (err) {
        console.error('Error ensuring profile:', err);
      }
    };

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await ensureProfileExists(session.user);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session) {
        await ensureProfileExists(session.user);
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (isMock) {
      const savedMockProfile = localStorage.getItem('dharasetu_mock_profile');
      if (savedMockProfile) {
        setProfile(JSON.parse(savedMockProfile));
      }
      return;
    }
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Sign up handler
  const signUp = async (email, password, fullName, phone = '') => {
    if (isMock) {
      // Simulate sign up
      const mockUserId = 'mock-' + Math.random().toString(36).substr(2, 9);
      const mockUser = { id: mockUserId, email };
      const mockProfile = {
        id: mockUserId,
        full_name: fullName,
        email,
        phone,
        is_agent: false,
        created_at: new Date().toISOString()
      };
      
      localStorage.setItem('dharasetu_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('dharasetu_mock_profile', JSON.stringify(mockProfile));
      
      setUser(mockUser);
      setProfile(mockProfile);
      return { data: { user: mockUser }, error: null };
    }

    // Live Supabase Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) return { data: null, error };

    if (data.user) {
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          full_name: fullName,
          email,
          phone,
          is_agent: false
        });

      if (profileError) console.error('Error inserting profile details:', profileError);
    }

    return { data, error: null };
  };

  // Sign in handler
  const signIn = async (email, password) => {
    if (isMock) {
      // For mock testing, support quick access accounts:
      let isAgent = false;
      let name = 'Mock User';
      let phone = '1234567890';
      
      if (email.startsWith('agent')) {
        isAgent = true;
        name = 'Agent Santosh Kumar';
        phone = '9934316418';
      }

      const mockUserId = isAgent ? 'mock-agent-id' : 'mock-user-id';
      const mockUser = { id: mockUserId, email };
      const mockProfile = {
        id: mockUserId,
        full_name: name,
        email,
        phone,
        is_agent: isAgent,
        created_at: new Date().toISOString()
      };

      localStorage.setItem('dharasetu_mock_user', JSON.stringify(mockUser));
      localStorage.setItem('dharasetu_mock_profile', JSON.stringify(mockProfile));
      
      setUser(mockUser);
      setProfile(mockProfile);
      return { data: { user: mockUser }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  // Sign out handler
  const signOut = async () => {
    if (isMock) {
      localStorage.removeItem('dharasetu_mock_user');
      localStorage.removeItem('dharasetu_mock_profile');
      setUser(null);
      setProfile(null);
      return { error: null };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Resend verification email handler
  const resendVerificationEmail = async (email) => {
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { error: null };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getRedirectUrl()
      }
    });
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isMock,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      resendVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
