'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  const [showInstallLink, setShowInstallLink] = useState(false);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Prüfe ob Mobile Device
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    // Prüfe ob bereits als App gestartet
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                      || (window.navigator as any).standalone;
    
    // Erkenne Device Type
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    setShowInstallLink(isMobile && !isStandalone);
    setDeviceType(isIOS ? 'ios' : isAndroid ? 'android' : null);
  }, []);

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
            alt="KTV Fussball" 
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
          alt="KTV Fussball" 
          className="h-[49px] object-contain object-left"
        />
      </div>

      <div className="max-w-md mx-auto mt-20 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            KTV AH Fussball
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

          {/* App Installation Link */}
          {showInstallLink && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowInstallPopup(true)}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Als App installieren
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Install Popup */}
      {showInstallPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowInstallPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              App installieren
            </h2>

            {deviceType === 'ios' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Installiere die App auf deinem iPhone/iPad:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <p className="text-gray-700">
                      Tippe auf das <strong>Teilen-Icon</strong> <span className="text-xl">□↑</span> unten in Safari
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <p className="text-gray-700">
                      Scrolle nach unten und wähle <strong>"Zum Home-Bildschirm"</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <p className="text-gray-700">
                      Tippe auf <strong>"Hinzufügen"</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">✅</div>
                    <p className="text-gray-700">
                      Die App erscheint jetzt auf deinem Home-Bildschirm!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {deviceType === 'android' && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                  Installiere die App auf deinem Android-Gerät:
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <p className="text-gray-700">
                      Tippe auf die <strong>3 Punkte</strong> <span className="text-xl">⋮</span> oben rechts
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <p className="text-gray-700">
                      Wähle <strong>"Zum Startbildschirm hinzufügen"</strong> oder <strong>"App installieren"</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <p className="text-gray-700">
                      Bestätige mit <strong>"Hinzufügen"</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">✅</div>
                    <p className="text-gray-700">
                      Die App erscheint jetzt auf deinem Startbildschirm!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowInstallPopup(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
