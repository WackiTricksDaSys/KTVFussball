'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, LogOut, Database } from 'lucide-react';
import { Member, Event } from '@/lib/supabase';
import MigrationsPanel from './MigrationsPanel';
import { 
  getAllMembers, 
  createMember, 
  toggleMemberActive,
  getAllEvents,
  createEvent,
  deleteEvent,
  getAllRegistrations
} from '@/lib/db';

interface AdminViewProps {
  currentUser: Member;
  onLogout: () => void;
  onSwitchView: (view: 'user') => void;
}

const HEADER_IMAGE = '/header.png';

export default function AdminView({ currentUser, onLogout, onSwitchView }: AdminViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ nickname: '', email: '' });
  const [newEvent, setNewEvent] = useState({ date: '', timeFrom: '', timeTo: '', location: '' });
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [showMigrations, setShowMigrations] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, eventsData, regsData] = await Promise.all([
        getAllMembers(),
        getAllEvents(),
        getAllRegistrations()
      ]);
      setMembers(membersData);
      setEvents(eventsData);
      setRegistrations(regsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.nickname || !newMember.email) {
      alert('Bitte Nickname und E-Mail eingeben');
      return;
    }

    try {
      const { member, password } = await createMember(newMember.nickname, newMember.email);
      setMembers([...members, member]);
      setGeneratedPassword(password);
      setNewMember({ nickname: '', email: '' });
    } catch (error) {
      alert('Fehler beim Erstellen des Mitglieds');
      console.error(error);
    }
  };

  const handleToggleMemberActive = async (memberId: number, isActive: boolean) => {
    try {
      await toggleMemberActive(memberId, !isActive);
      setMembers(members.map(m => m.id === memberId ? { ...m, is_active: !isActive } : m));
    } catch (error) {
      alert('Fehler beim Ändern des Status');
      console.error(error);
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.date || !newEvent.timeFrom || !newEvent.timeTo || !newEvent.location) {
      alert('Bitte alle Felder ausfüllen');
      return;
    }

    try {
      const event = await createEvent(newEvent.date, newEvent.timeFrom, newEvent.timeTo, newEvent.location);
      setEvents([...events, event]);
      setNewEvent({ date: '', timeFrom: '', timeTo: '', location: '' });
    } catch (error) {
      alert('Fehler beim Erstellen des Events');
      console.error(error);
    }
  };

  const countYes = (eventId: number) => {
    const yesRegs = registrations.filter(r => r.event_id === eventId && r.status === 'yes');
    const memberCount = yesRegs.length;
    const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
    return { members: memberCount, guests: guestCount, total: memberCount + guestCount };
  };

  const futureEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Lädt...</div>;
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
      
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin-Bereich</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700">{currentUser.nickname}</span>
            <button
              onClick={() => onSwitchView('user')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium"
            >
              Zur Anmeldeliste
            </button>
            <button
              onClick={() => setShowMigrations(!showMigrations)}
              className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition flex items-center gap-2"
            >
              <Database className="w-5 h-5" />
              DB-Setup
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800 transition">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Migrations Panel */}
        {showMigrations && (
          <MigrationsPanel />
        )}

        {/* Generated Password Popup */}
        {generatedPassword && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">Mitglied erfolgreich erstellt!</h3>
            <p className="text-sm text-green-700 mb-2">
              Initial-Passwort: <span className="font-mono font-bold">{generatedPassword}</span>
            </p>
            <p className="text-xs text-green-600 mb-3">
              Bitte teile dieses Passwort dem Mitglied per E-Mail mit. Es muss beim ersten Login geändert werden.
            </p>
            <button
              onClick={() => setGeneratedPassword(null)}
              className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              OK
            </button>
          </div>
        )}

        {/* Mitglieder-Verwaltung */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Users className="w-5 h-5 mr-2" />
            Mitglieder-Verwaltung
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-700">Neues Mitglied hinzufügen</h3>
            <div className="flex gap-3">
              <input
                placeholder="Nickname"
                value={newMember.nickname}
                onChange={(e) => setNewMember({...newMember, nickname: e.target.value})}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="E-Mail"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddMember}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Hinzufügen
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700">Nickname</th>
                  <th className="px-4 py-3 text-left text-gray-700">E-Mail</th>
                  <th className="px-4 py-3 text-left text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-gray-700">Rolle</th>
                  <th className="px-4 py-3 text-left text-gray-700">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {members.map(m => (
                  <tr key={m.id} className={!m.is_active ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-semibold">{m.nickname}</td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {m.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {m.is_admin && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleMemberActive(m.id, m.is_active)}
                        className={`px-4 py-1 rounded-lg text-sm font-semibold ${m.is_active ? 'bg-gray-200 hover:bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {m.is_active ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event-Verwaltung */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            <Calendar className="w-5 h-5 mr-2" />
            Event-Verwaltung
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-700">Neues Event erstellen</h3>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Ort"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                placeholder="Von"
                value={newEvent.timeFrom}
                onChange={(e) => setNewEvent({...newEvent, timeFrom: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="time"
                placeholder="Bis"
                value={newEvent.timeTo}
                onChange={(e) => setNewEvent({...newEvent, timeTo: e.target.value})}
                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleAddEvent}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold w-full"
            >
              Event erstellen
            </button>
          </div>

          <div className="space-y-3">
            {futureEvents.map(e => (
              <div key={e.id} className="p-4 border rounded-lg hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {new Date(e.date).toLocaleDateString('de-DE', { 
                        weekday: 'short',
                        day: '2-digit', 
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-600">{e.time_from} - {e.time_to} Uhr</div>
                    <div className="text-gray-600">{e.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{countYes(e.id).total}</div>
                    <div className="text-sm text-gray-500">Zusagen</div>
                    {countYes(e.id).guests > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        +{countYes(e.id).guests} Gäste
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {futureEvents.length === 0 && (
              <p className="text-gray-500 text-center py-4">Keine zukünftigen Events</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
