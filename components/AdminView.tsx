'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, LogOut, Trash2, Undo } from 'lucide-react';
import { Member, Event } from '@/lib/supabase';
import { Season } from '@/lib/season-config';
import { 
  getAllMembers, 
  createMember, 
  toggleMemberActive,
  getAllEvents,
  createEvent,
  deleteEvent,
  getAllRegistrations,
  getCurrentSeason,
  setCurrentSeason
} from '@/lib/db';
import { getSeasonSettings } from '@/lib/season-config';

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
  const [currentSeason, setCurrentSeasonState] = useState<Season>('summer');
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

  useEffect(() => {
    loadData();
    loadSeason();
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

  const loadSeason = async () => {
    const season = await getCurrentSeason();
    setCurrentSeasonState(season);
  };

  const handleSeasonChange = async (season: Season) => {
    try {
      await setCurrentSeason(season);
      setCurrentSeasonState(season);
    } catch (error) {
      alert('Fehler beim Ändern der Saison');
      console.error(error);
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
    if (!newEvent.location || !newEvent.timeFrom || !newEvent.timeTo || 
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
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        
        if (newEvent.weekdays.includes(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const event = await createEvent(
            dateStr, 
            newEvent.timeFrom, 
            newEvent.timeTo, 
            newEvent.location
          );
          createdEvents.push(event);
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setEvents([...events, ...createdEvents].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      
      setNewEvent({ 
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

  const handleDeleteEvent = async (eventId: number, eventDate: string) => {
    const confirmed = window.confirm(`Event am ${eventDate} wirklich löschen? Alle Anmeldungen werden ebenfalls gelöscht.`);
    
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      setRegistrations(registrations.filter(r => r.event_id !== eventId));
      alert('Event erfolgreich gelöscht');
    } catch (error) {
      alert('Fehler beim Löschen des Events');
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

  const futureEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const seasonSettings = getSeasonSettings(currentSeason);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Lädt...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white">
        <div className="bg-ktv-red h-[49px] w-full">
          <img 
            src={HEADER_IMAGE} 
            alt="KTV Fußball" 
            className="h-[49px] object-contain object-left"
          />
        </div>
        
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-gray-700">{currentUser.nickname}</span>
              <button
                onClick={() => onSwitchView('user')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
                title="Zur Anmeldeliste"
              >
                <Undo className="w-6 h-6" />
              </button>
              <button onClick={onLogout} className="text-gray-600 hover:text-gray-800 transition">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
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

          <div>
            <h3 className="font-semibold mb-3 text-gray-700">Zukünftige Events</h3>
            <div className="space-y-2">
              {futureEvents.map(e => {
                const dateStr = new Date(e.date).toLocaleDateString('de-CH', { 
                  weekday: 'short',
                  day: '2-digit', 
                  month: '2-digit',
                  year: 'numeric'
                });
                const formattedDate = dateStr.slice(0, 2) + dateStr.slice(4);
                
                return (
                  <div key={e.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                    <span className="font-semibold text-gray-800">{formattedDate}</span>
                    <button
                      onClick={() => handleDeleteEvent(e.id, formattedDate)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Event löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
              {futureEvents.length === 0 && (
                <p className="text-gray-500 text-center py-4">Keine zukünftigen Events</p>
              )}
            </div>
          </div>
        </div>

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
                {members
                  .sort((a, b) => {
                    if (a.is_admin && a.is_active && (!b.is_admin || !b.is_active)) return -1;
                    if (b.is_admin && b.is_active && (!a.is_admin || !a.is_active)) return 1;
                    if (a.is_active && !a.is_admin && (!b.is_active || b.is_admin)) return -1;
                    if (b.is_active && !b.is_admin && (!a.is_active || a.is_admin)) return 1;
                    if (!a.is_active && b.is_active) return 1;
                    if (!b.is_active && a.is_active) return -1;
                    return a.nickname.localeCompare(b.nickname);
                  })
                  .map(m => (
                  <tr key={m.id} className={!m.is_active ? 'opacity-50' : ''}>
                    <td className="px-4 py-3 font-semibold">{m.nickname}</td>
                    <td className="px-4 py-3 text-gray-600">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm ${m.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {m.is_active ? 'Aktiv' : 'Blockiert'}
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
                        {m.is_active ? 'Blockieren' : 'Aktivieren'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Saison & Utensilien */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
            Saison & Utensilien
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => handleSeasonChange('summer')}
              className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                currentSeason === 'summer'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>☀️</span>
              Sommer
            </button>
            <button
              onClick={() => handleSeasonChange('winter')}
              className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                currentSeason === 'winter'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>❄️</span>
              Winter
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-gray-700">Benötigte Utensilien</h3>
            <ul className="space-y-2">
              {seasonSettings.items.map(item => (
                <li key={item} className="text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-gray-700 rounded-full"></span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">
                <span className="font-semibold">Mindestanzahl Spieler:</span>{' '}
                <span className="font-bold text-blue-600">{seasonSettings.minPlayers}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 }
