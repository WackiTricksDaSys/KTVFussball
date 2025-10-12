import React, { useState } from 'react';
import { Calendar, Users, LogOut, Settings, MessageSquare, Check, X, Database, Copy, CheckCircle } from 'lucide-react';

// Demo-Daten
const DEMO_MEMBERS = [
  { id: 1, nickname: 'Max', email: 'ransient.t@gmail.com', isActive: true, isAdmin: true },
  { id: 2, nickname: 'Anna', email: 'anna@test.de', isActive: true, isAdmin: false },
  { id: 3, nickname: 'Tom', email: 'tom@test.de', isActive: true, isAdmin: false },
  { id: 4, nickname: 'Lisa', email: 'lisa@test.de', isActive: false, isAdmin: false },
];

const DEMO_EVENTS = [
  { id: 1, date: '2025-10-15', timeFrom: '18:00', timeTo: '20:00', location: 'Sportplatz Süd' },
  { id: 2, date: '2025-10-18', timeFrom: '19:00', timeTo: '21:00', location: 'Halle Nord' },
  { id: 3, date: '2025-10-22', timeFrom: '18:30', timeTo: '20:30', location: 'Sportplatz Süd' },
];

const DEMO_REGISTRATIONS = [
  { id: 1, memberId: 1, eventId: 1, status: 'yes', comment: 'Bin dabei!', guests: 2, items: { schluessel: true, ball: false, ueberzieher: true, handschuhe: false, pumpe: false } },
  { id: 2, memberId: 2, eventId: 1, status: 'no', comment: 'Ich kann nicht, aber mein Bruder kommt', guests: 1, items: {} },
  { id: 3, memberId: 1, eventId: 2, status: 'yes', comment: '', guests: 1, items: { hallenball: true, pumpe: true, ueberzieher: false } },
  { id: 4, memberId: 3, eventId: 1, status: 'yes', comment: '', guests: 0, items: { pumpe: true, ball: true } },
];

// Utensilien-Definitionen (in richtiger Reihenfolge!)
const ITEMS_SUMMER = ['Schlüssel', 'Ball', 'Überzieher', 'Handschuhe', 'Pumpe'];
const ITEMS_WINTER = ['Hallenball', 'Überzieher', 'Pumpe'];

export default function KTVFootballApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [view, setView] = useState('login');
  const [members, setMembers] = useState(DEMO_MEMBERS);
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [registrations, setRegistrations] = useState(DEMO_REGISTRATIONS);
  const [newMember, setNewMember] = useState({ nickname: '', email: '' });
  const [newEvent, setNewEvent] = useState({ date: '', timeFrom: '', timeTo: '', location: '' });
  const [showMigrations, setShowMigrations] = useState(false);
  const [copied, setCopied] = useState(null);
  const [season, setSeason] = useState('summer'); // 'summer' oder 'winter'
  
  // Dialog State (neues UX)
  const [dialog, setDialog] = useState(null); // { memberId, eventId, status, comment, guests, items }

  const handleLogin = () => {
    const user = members.find(m => m.email === loginEmail);
    if (user) {
      setCurrentUser(user);
      setView('user'); // Alle landen auf der Anmeldeliste
    } else {
      alert('Login fehlgeschlagen!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
    setLoginEmail('');
  };

  const handleAddMember = () => {
    if (newMember.nickname && newMember.email) {
      const member = { id: members.length + 1, ...newMember, isActive: true, isAdmin: false };
      setMembers([...members, member]);
      setNewMember({ nickname: '', email: '' });
    }
  };

  const toggleMemberActive = (id) => {
    setMembers(members.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  const handleAddEvent = () => {
    if (newEvent.date && newEvent.timeFrom && newEvent.timeTo && newEvent.location) {
      const event = { id: events.length + 1, ...newEvent };
      setEvents([...events, event]);
      setNewEvent({ date: '', timeFrom: '', timeTo: '', location: '' });
    }
  };

  // NEUES UX: Klick auf Zelle öffnet Dialog
  const handleCellClick = (memberId, eventId) => {
    if (memberId !== currentUser.id) return;
    if (!currentUser.isActive) {
      alert('Dein Account ist inaktiv.');
      return;
    }

    const existing = registrations.find(r => r.memberId === memberId && r.eventId === eventId);
    const currentItems = season === 'summer' 
      ? { schluessel: false, ball: false, ueberzieher: false, handschuhe: false, pumpe: false }
      : { hallenball: false, ueberzieher: false, pumpe: false };
    
    setDialog({
      memberId,
      eventId,
      status: existing?.status || 'pending',
      comment: existing?.comment || '',
      guests: existing?.guests || 0,
      items: existing?.items || currentItems
    });
  };

  const saveDialog = () => {
    const existing = registrations.find(r => r.memberId === dialog.memberId && r.eventId === dialog.eventId);
    
    if (existing) {
      setRegistrations(registrations.map(r =>
        r.id === existing.id ? { ...r, status: dialog.status, comment: dialog.comment, guests: dialog.guests, items: dialog.items } : r
      ));
    } else {
      setRegistrations([...registrations, {
        id: registrations.length + 1,
        memberId: dialog.memberId,
        eventId: dialog.eventId,
        status: dialog.status,
        comment: dialog.comment,
        guests: dialog.guests,
        items: dialog.items
      }]);
    }
    setDialog(null);
  };

  const getRegistration = (memberId, eventId) => {
    return registrations.find(r => r.memberId === memberId && r.eventId === eventId);
  };

  const countYes = (eventId) => {
    const yesRegs = registrations.filter(r => r.eventId === eventId && r.status === 'yes');
    const memberCount = yesRegs.length;
    const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0); // NUR von Zusagen!
    return { members: memberCount, guests: guestCount, total: memberCount + guestCount };
  };

  const futureEvents = events.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const activeMembers = members.filter(m => m.isActive).sort((a, b) => a.nickname.localeCompare(b.nickname));

  const copySQL = (sql, name) => {
    navigator.clipboard.writeText(sql);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCurrentItems = () => season === 'summer' ? ITEMS_SUMMER : ITEMS_WINTER;
  
  const getItemKey = (item) => item.toLowerCase().replace('ü', 'ue');
  
  const getItemsForEvent = (eventId) => {
    const items = getCurrentItems();
    const result = {};
    items.forEach(item => {
      const key = getItemKey(item);
      const regs = registrations.filter(r => r.eventId === eventId && r.items?.[key]);
      if (regs.length > 0) {
        const names = regs.map(reg => {
          const member = members.find(m => m.id === reg.memberId);
          return member?.nickname || '';
        }).filter(n => n);
        result[item] = names; // Array von Namen
      }
    });
    return result;
  };

  // Login Screen
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="w-full h-32 bg-gray-200 flex items-center justify-center" style={{backgroundImage: 'url(/header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          {/* Fallback wenn Bild nicht lädt */}
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Login</h2>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="E-Mail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Login
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              Demo: ransient.t@gmail.com (Admin) oder anna@test.de (User)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  if (view === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-md">
          <div className="w-full h-24 bg-gray-200" style={{backgroundImage: 'url(/header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
            {/* Fallback wenn Bild nicht lädt */}
          </div>
          <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Admin-Bereich</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{currentUser.nickname}</span>
              </span>
              <button onClick={() => setView('user')} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">
                Zur Anmeldeliste
              </button>
              <button onClick={() => setShowMigrations(!showMigrations)} className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-1">
                <Database className="w-4 h-4" />
                DB-Setup
              </button>
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {showMigrations && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Datenbank-Setup</h2>
              </div>
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <strong>Anleitung:</strong> Gehe zu supabase.com → SQL Editor → Kopiere SQL → Run
              </div>
              <div className="border rounded-lg">
                <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">001_initial_setup</h3>
                    <p className="text-sm text-gray-600">Erstellt alle Tabellen</p>
                  </div>
                  <button onClick={() => copySQL('SQL CODE HERE', '001')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    {copied === '001' ? <><CheckCircle className="w-4 h-4" /><span>Kopiert!</span></> : <><Copy className="w-4 h-4" /><span>SQL kopieren</span></>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Saison-Auswahl */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Saison & Utensilien</h2>
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => setSeason('summer')} 
                className={`flex-1 py-3 rounded-lg font-semibold ${season === 'summer' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}
              >
                ☀️ Sommer
              </button>
              <button 
                onClick={() => setSeason('winter')} 
                className={`flex-1 py-3 rounded-lg font-semibold ${season === 'winter' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                ❄️ Winter
              </button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Benötigte Utensilien:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {getCurrentItems().map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          {/* Mitglieder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Users className="w-5 h-5 mr-2" />Mitglieder</h2>
            <div className="mb-4 flex gap-3">
              <input placeholder="Nickname" value={newMember.nickname} onChange={(e) => setNewMember({...newMember, nickname: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg" />
              <input type="email" placeholder="E-Mail" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} className="flex-1 px-3 py-2 border rounded-lg" />
              <button onClick={handleAddMember} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Hinzufügen</button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr><th className="px-4 py-3 text-left">Nickname</th><th className="px-4 py-3 text-left">E-Mail</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Aktion</th></tr>
              </thead>
              <tbody className="divide-y">
                {members.map(m => (
                  <tr key={m.id}><td className="px-4 py-3">{m.nickname}</td><td className="px-4 py-3">{m.email}</td><td className="px-4 py-3"><span className={`px-3 py-1 rounded-full text-sm ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{m.isActive ? 'Aktiv' : 'Inaktiv'}</span></td><td className="px-4 py-3"><button onClick={() => toggleMemberActive(m.id)} className="px-4 py-1 rounded-lg text-sm bg-gray-200 hover:bg-gray-300">{m.isActive ? 'Deaktivieren' : 'Aktivieren'}</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Events */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" />Events</h2>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input placeholder="Ort" value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input type="time" value={newEvent.timeFrom} onChange={(e) => setNewEvent({...newEvent, timeFrom: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <input type="time" value={newEvent.timeTo} onChange={(e) => setNewEvent({...newEvent, timeTo: e.target.value})} className="px-3 py-2 border rounded-lg" />
              <button onClick={handleAddEvent} className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Event erstellen</button>
            </div>
            <div className="space-y-3">
              {futureEvents.map(e => {
                const counts = countYes(e.id);
                return (
                  <div key={e.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between">
                      <div><div className="font-bold">{new Date(e.date).toLocaleDateString('de-DE')}</div><div className="text-sm text-gray-600">{e.timeFrom}-{e.timeTo} • {e.location}</div></div>
                      <div className="text-right"><div className="text-2xl font-bold text-blue-600">{counts.total}</div><div className="text-xs text-gray-500">{counts.guests > 0 && `+${counts.guests} Gäste`}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User View (Anmeldeliste)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="w-full h-24 bg-gray-200" style={{backgroundImage: 'url(/header.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
          {/* Fallback wenn Bild nicht lädt */}
        </div>
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Anmeldung</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600"><span className="font-semibold">{currentUser.nickname}</span></span>
            {currentUser.isAdmin && <button onClick={() => setView('admin')} className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg">Admin-Bereich</button>}
            <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {!currentUser.isActive && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>Account inaktiv:</strong> Du kannst Events sehen, aber keine Änderungen vornehmen.
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left sticky left-0 bg-gray-100 z-10">Spieler</th>
                {futureEvents.map(e => (
                  <th key={e.id} className="px-4 py-3 text-center min-w-[120px]">
                    <div className="font-bold">{new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</div>
                    <div className="text-xs text-gray-600">{e.timeFrom}-{e.timeTo}</div>
                    <div className="text-xs text-gray-500">{e.location}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Utensilien-Zeilen */}
              {getCurrentItems().map(item => {
                const itemKey = getItemKey(item);
                return (
                  <tr key={item} className="bg-yellow-50 border-b border-yellow-200">
                    <td className="px-4 py-2 text-sm font-semibold text-gray-700 sticky left-0 bg-yellow-50 z-10">
                      {item}
                    </td>
                    {futureEvents.map(event => {
                      const items = getItemsForEvent(event.id);
                      const names = items[item] || [];
                      return (
                        <td key={event.id} className="px-4 py-2 text-center text-sm">
                          {names.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {names.map((name, idx) => (
                                <span key={idx} className="font-semibold text-green-700">{name}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              
              {/* Trennlinie */}
              <tr className="h-2 bg-gray-200"></tr>
              
              {/* Spieler-Zeilen */}
              {activeMembers.map(member => (
                <tr key={member.id} className={member.id === currentUser.id ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-3 font-semibold sticky left-0 bg-white z-10">
                    {member.nickname}{member.id === currentUser.id && <span className="ml-2 text-blue-600 text-sm">(Du)</span>}
                  </td>
                  {futureEvents.map(event => {
                    const reg = getRegistration(member.id, event.id);
                    const isOwn = member.id === currentUser.id;
                    return (
                      <td key={event.id} className="px-2 py-2 text-center">
                        <button
                          onClick={() => isOwn && handleCellClick(member.id, event.id)}
                          className={`relative w-full h-16 rounded-lg flex flex-col items-center justify-center transition ${
                            reg?.status === 'yes' ? 'bg-green-500 text-white' :
                            reg?.status === 'no' ? 'bg-red-500 text-white' :
                            'bg-gray-100'
                          } ${isOwn ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                        >
                          {reg?.status === 'yes' && <Check className="w-6 h-6" />}
                          {reg?.status === 'no' && <X className="w-6 h-6" />}
                          {reg?.guests > 0 && <span className="text-xs mt-1 font-bold">+{reg.guests}</span>}
                          {reg?.comment && (
                            <MessageSquare className="absolute top-1 right-1 w-5 h-5 opacity-70 stroke-2" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 sticky left-0 bg-gray-100 z-10">Total</td>
                {futureEvents.map(e => {
                  const counts = countYes(e.id);
                  return (
                    <td key={e.id} className="px-4 py-3 text-center">
                      <div className="text-xl text-blue-600">{counts.total}</div>
                      {counts.guests > 0 && <div className="text-xs text-gray-600">({counts.members}+{counts.guests})</div>}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500 rounded"></div><span>Zusage</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500 rounded"></div><span>Absage</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded"></div><span>Keine Angabe</span></div>
        </div>
      </div>

      {/* NEUER Dialog - SCROLLBAR FIX */}
      {dialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8">
            <h3 className="text-xl font-bold mb-4">Anmeldung bearbeiten</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Utensilien mitnehmen</label>
              <div className="grid grid-cols-2 gap-2">
                {getCurrentItems().map(item => {
                  const key = getItemKey(item);
                  return (
                    <label key={item} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={dialog.items?.[key] || false}
                        onChange={(e) => setDialog({...dialog, items: {...dialog.items, [key]: e.target.checked}})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{item}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Teilnahme</label>
              <div className="flex gap-3">
                <button onClick={() => setDialog({...dialog, status: 'yes'})} className={`flex-1 py-3 rounded-lg font-semibold ${dialog.status === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                  <Check className="w-5 h-5 mx-auto mb-1" />Zusage
                </button>
                <button onClick={() => setDialog({...dialog, status: 'no'})} className={`flex-1 py-3 rounded-lg font-semibold ${dialog.status === 'no' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}>
                  <X className="w-5 h-5 mx-auto mb-1" />Absage
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Anzahl Gäste</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setDialog({...dialog, guests: Math.max(0, dialog.guests - 1)})} className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold">−</button>
                <div className="flex-1 text-center"><span className="text-3xl font-bold text-blue-600">{dialog.guests}</span><div className="text-xs text-gray-500">Gäste</div></div>
                <button onClick={() => setDialog({...dialog, guests: Math.min(10, dialog.guests + 1)})} className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">+</button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Kommentar</label>
              <textarea value={dialog.comment} onChange={(e) => setDialog({...dialog, comment: e.target.value})} placeholder="Optional..." className="w-full px-3 py-2 border rounded-lg h-24" />
            </div>

            <div className="flex gap-3">
              <button onClick={saveDialog} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">Speichern</button>
              <button onClick={() => setDialog(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold">Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
