'use client';

import { useEffect, useState } from 'react';
import LoginView from '@/components/LoginView';
import AdminView from '@/components/AdminView';
import UserView from '@/components/UserView';
import { Member } from '@/lib/supabase';
import { runMigrations } from '@/lib/migrations';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [view, setView] = useState<'login' | 'admin' | 'user'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Run migrations on app start
    runMigrations().then(() => {
      setLoading(false);
    });

    // Check for stored session
    const storedUser = localStorage.getItem('ktv_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setView('user'); // Alle landen auf der Anmeldeliste
    }
  }, []);

  const handleLogin = (user: Member) => {
    setCurrentUser(user);
    setView('user'); // Alle landen auf der Anmeldeliste
    localStorage.setItem('ktv_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    localStorage.removeItem('ktv_user');
  };

  const switchView = (newView: 'admin' | 'user') => {
    setView(newView);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading KTV AH Fussball...</div>
      </div>
    );
  }

  if (view === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  if (view === 'admin' && currentUser?.is_admin) {
    return <AdminView currentUser={currentUser} onLogout={handleLogout} onSwitchView={switchView} />;
  }

  return <UserView currentUser={currentUser!} onLogout={handleLogout} onSwitchView={switchView} />;
}
