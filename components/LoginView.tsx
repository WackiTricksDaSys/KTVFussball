'use client';

import { useState } from 'react';
import { Member } from '@/lib/supabase';
import { getMemberByEmail, verifyPassword, updateMemberPassword } from '@/lib/db';

interface LoginViewProps {
  onLogin: (user: Member) => void;
}

const HEADER_IMAGE = '/header.png';

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await getMemberByEmail(email);
      
      if (!user) {
        setError('E-Mail oder Passwort falsch');
        setLoading(false);
        return;
      }

      const isValid = await verifyPassword(password, user.password_hash);
      
      if (!isValid) {
        setError('E-Mail oder Passwort falsch');
        setLoading(false);
        return;
      }

      if (user.must_change_password) {
        setMustChangePassword(true);
        setCurrentUser(user);
        setLoading(false);
        return;
      }

      onLogin(user);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      await updateMemberPassword(currentUser!.id, newPassword);
      const updatedUser = { ...currentUser!, must_change_password: false };
      onLogin(updatedUser);
    } catch (err) {
      setError('Fehler beim Ändern des Passworts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (mustChangePassword) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header mit Bild - 49px hoch */}
        <div className="bg-ktv-red h-[49px] w-full">
          <img 
            src={HEADER_IMAGE} 
            alt="KTV Fußball" 
            className="h-[49px] object-contain object-left"
          />
        </div>

        <div className="max-w-md mx-auto mt-20 px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
              Passwort ändern
            </h1>
            <p className="text-sm text-gray-600 text-center mb-6">
              Bitte ändere dein Passwort beim ersten Login
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                placeholder="Neues Passwort (min. 6 Zeichen)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Wird geändert...' : 'Passwort ändern'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Bild - 49px hoch */}
      <div className="bg-ktv-red h-[49px] w-full">
        <img 
          src={HEADER_IMAGE} 
          alt="KTV Fußball" 
          className="h-[49px] object-contain object-left"
        />
      </div>

      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            KTV Fußball Login
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Anmelden...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
