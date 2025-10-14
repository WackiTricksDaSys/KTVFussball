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

const HEADER_IMAGE = 'https://lh3.googleusercontent.com/d/1P2sNAGHzdN4jWfKrQ0-vJCAcq2iiM1Bl';

export default function AdminView({ currentUser, onLogout, onSwitchView }: AdminViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ nickname: '', email: '' });
  const [newEvent, setNewEvent] = useState({ 
    location: '', 
    timeFrom: '', 
    timeTo: '', 
    dateFrom: '', 
    dateTo: '', 
    weekdays: [] as number[] 
  });
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
    if (!newEvent.name || !newEvent.location || !newEvent.timeFrom || !newEvent.timeTo || 
        !newEvent.dateFrom || !newEvent.dateTo || newEvent.weekdays.length === 0) {
      alert('Bitte alle Felder ausfüllen und mindestens einen Wochentag auswählen');
      return;
    }

    try {
      const startDate = new Date(newEvent.dateFrom);
      const endDate = new Date(newEvent.dateTo);
      
      if (startDate > endDate) {
        alert('Start-Datum muss vor End-Datum liegen');
        return;
      }

      const createdEvents = [];
      const currentDate = new Date(startDate);
      
      // Iteriere durch alle Tage im Range
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sonntag, 1 = Montag, etc.
        
        // Prüfe ob dieser Wochentag ausgewählt wurde
        if (newEvent.weekdays.includes(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const event = await createEvent(
            dateStr, 
            newEvent.timeFrom, 
            newEvent.timeTo, 
            newEvent.location,
            newEvent.name
          );
          createdEvents.push(event);
        }
        
        // Nächster Tag
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setEvents([...events, ...createdEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      
      setNewEvent({ 
        name: '', 
        location: '', 
        timeFrom: '', 
        timeTo: '', 
        dateFrom: '', 
        dateTo: '', 
        weekdays: [] 
      });
      
      alert(`${createdEvents.length} Event(s) erfolgreich erstellt!`);
    } catch (error) {
      alert('Fehler beim Erstellen der Events');
      console.error(error);
    }
  };

  const toggleWeekday = (day: number) => {
    if (newEvent.weekdays.includes(day)) {
      setNewEvent({
        ...newEvent,
        weekdays: newEvent.weekdays.filter(d => d !== day)
      });
    } else {
      setNewEvent({
        ...newEvent,
        weekdays: [...newEvent.weekdays, day].sort()
      });
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
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="relative">
          <img 
            src={HEADER_IMAGE} 
            alt="KTV Fußball" 
            className="w-full h-32 object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Admin-Bereich</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hallo, <span className="font-semibold">{currentUser.nickname}</span>
            </span>
            <button
              onClick={() => onSwitchView('user')}
              className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Zur Anmeldeliste
            </button>
            <button
              onClick={() => setShowMigrations(!showMigrations)}
              className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition flex items-center gap-1"
            >
              <Database className="w-4 h-4" />
              DB-Setup
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800 transition">
              <LogOut className="w-5 h-5" />
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
            <div className="space-y-3">
              <input
                placeholder="Nickname"
                value={newMember.nickname}
                onChange={(e) => setNewMember({...newMember, nickname: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="E-Mail"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddMember}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
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
            <h3 className="font-semibold mb-3 text-gray-700">Neue Events erstellen</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event-Name</label>
                <input
                  type="text"
                  placeholder="z.B. Training, Turnier"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                <input
                  type="text"
                  placeholder="z.B. Sportplatz Musterstadt"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Von (Datum)</label>
                  <input
                    type="date"
                    value={newEvent.dateFrom}
                    onChange={(e) => setNewEvent({...newEvent, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bis (Datum)</label>
                  <input
                    type="date"
                    value={newEvent.dateTo}
                    onChange={(e) => setNewEvent({...newEvent, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Von (Zeit)</label>
                  <input
                    type="time"
                    value={newEvent.timeFrom}
                    onChange={(e) => setNewEvent({...newEvent, timeFrom: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bis (Zeit)</label>
                  <input
                    type="time"
                    value={newEvent.timeTo}
                    onChange={(e) => setNewEvent({...newEvent, timeTo: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wochentage</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { day: 1, label: 'Mo' },
                    { day: 2, label: 'Di' },
                    { day: 3, label: 'Mi' },
                    { day: 4, label: 'Do' },
                    { day: 5, label: 'Fr' },
                    { day: 6, label: 'Sa' },
                    { day: 0, label: 'So' }
                  ].map(({ day, label }) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleWeekday(day)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        newEvent.weekdays.includes(day)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Wähle die Wochentage, an denen Events erstellt werden sollen
                </p>
              </div>
            </div>
            <button
              onClick={handleAddEvent}
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold w-full"
            >
              Events erstellen
            </button>
          </div>

          <div className="space-y-3">
            {futureEvents.map(e => (
              <div key={e.id} className="p-4 border rounded-lg hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    {e.name && (
                      <div className="text-sm font-semibold text-blue-600 mb-1">
                        {e.name}
                      </div>
                    )}
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
