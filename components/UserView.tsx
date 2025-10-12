'use client';

import { useState, useEffect } from 'react';
import { Calendar, LogOut, MessageSquare, Check, X, AlertCircle } from 'lucide-react';
import { Member, Event, Registration } from '@/lib/supabase';
import { 
  getAllMembers, 
  getFutureEvents,
  getAllRegistrations,
  upsertRegistration,
  isEventLocked
} from '@/lib/db';

interface UserViewProps {
  currentUser: Member;
  onLogout: () => void;
  onSwitchView: (view: 'admin') => void;
}

const HEADER_IMAGE = 'https://lh3.googleusercontent.com/d/1P2sNAGHzdN4jWfKrQ0-vJCAcq2iiM1Bl';

export default function UserView({ currentUser, onLogout, onSwitchView }: UserViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentPopup, setCommentPopup] = useState<{
    memberId: number;
    eventId: number;
    comment: string;
    guests: number;
    isOwn: boolean;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersData, eventsData, regsData] = await Promise.all([
        getAllMembers(),
        getFutureEvents(),
        getAllRegistrations()
      ]);
      setMembers(membersData.filter(m => m.is_active));
      setEvents(eventsData);
      setRegistrations(regsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRegistration = (memberId: number, eventId: number) => {
    return registrations.find(r => r.member_id === memberId && r.event_id === eventId);
  };

  const handleToggleRegistration = async (eventId: number) => {
    // Inaktive User können nicht anmelden
    if (!currentUser.is_active) {
      alert('Dein Account ist inaktiv. Du kannst keine Änderungen vornehmen.');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (isEventLocked(event)) {
      alert('Event ist gesperrt (weniger als 1 Stunde bis Start)');
      return;
    }

    const existing = getRegistration(currentUser.id, eventId);
    const newStatus = existing?.status === 'yes' ? 'no' : 'yes';

    try {
      await upsertRegistration(currentUser.id, eventId, newStatus, existing?.comment ?? undefined, existing?.guests || 0);
      
      if (existing) {
        setRegistrations(registrations.map(r =>
          r.id === existing.id ? { ...r, status: newStatus } : r
        ));
      } else {
        const newReg: Registration = {
          id: Date.now(),
          member_id: currentUser.id,
          event_id: eventId,
          status: newStatus,
          comment: null,
          guests: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRegistrations([...registrations, newReg]);
      }
    } catch (error) {
      alert('Fehler beim Speichern');
      console.error(error);
    }
  };

  const handleSaveComment = async (eventId: number, comment: string, guests: number) => {
    if (!currentUser.is_active) {
      alert('Dein Account ist inaktiv. Du kannst keine Änderungen vornehmen.');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (isEventLocked(event)) {
      alert('Event ist gesperrt (weniger als 1 Stunde bis Start)');
      return;
    }

    const existing = getRegistration(currentUser.id, eventId);
    const status = existing?.status || 'pending';

    try {
      await upsertRegistration(currentUser.id, eventId, status, comment || undefined, guests);
      
      if (existing) {
        setRegistrations(registrations.map(r =>
          r.id === existing.id ? { ...r, comment, guests } : r
        ));
      } else {
        const newReg: Registration = {
          id: Date.now(),
          member_id: currentUser.id,
          event_id: eventId,
          status,
          comment,
          guests,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRegistrations([...registrations, newReg]);
      }
      setCommentPopup(null);
    } catch (error) {
      alert('Fehler beim Speichern');
      console.error(error);
    }
  };

  const countYes = (eventId: number) => {
    const yesRegs = registrations.filter(r => r.event_id === eventId && r.status === 'yes');
    const memberCount = yesRegs.length;
    const guestCount = yesRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
    return { members: memberCount, guests: guestCount, total: memberCount + guestCount };
  };

  const sortedMembers = [...members].sort((a, b) => a.nickname.localeCompare(b.nickname));

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
          <h1 className="text-xl font-semibold text-gray-800">Anmeldung Events</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Hallo, <span className="font-semibold">{currentUser.nickname}</span>
            </span>
            {currentUser.is_admin && (
              <button
                onClick={() => onSwitchView('admin')}
                className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Admin-Bereich
              </button>
            )}
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Inactive User Warning */}
        {!currentUser.is_active && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">Account inaktiv</h3>
              <p className="text-sm text-yellow-700">
                Dein Account ist derzeit inaktiv. Du kannst die Events sehen, aber keine An- oder Abmeldungen vornehmen.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left sticky left-0 bg-gray-100 z-10 text-gray-700">Spieler</th>
                  {events.map(e => (
                    <th key={e.id} className="px-4 py-3 text-center min-w-[120px]">
                      <div className="font-bold text-gray-800">
                        {new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </div>
                      <div className="text-xs text-gray-600">{e.time_from}-{e.time_to}</div>
                      <div className="text-xs text-gray-500">{e.location}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedMembers.map(member => (
                  <tr key={member.id} className={member.id === currentUser.id ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-3 font-semibold sticky left-0 bg-white z-10">
                      {member.nickname}
                      {member.id === currentUser.id && (
                        <span className="ml-2 text-blue-600 text-sm">(Du)</span>
                      )}
                    </td>
                    {events.map(event => {
                      const reg = getRegistration(member.id, event.id);
                      const isCurrentUser = member.id === currentUser.id;
                      const locked = isEventLocked(event);
                      const canEdit = isCurrentUser && currentUser.is_active && !locked;
                      
                      return (
                        <td key={event.id} className="px-2 py-2 text-center">
                          <div className="relative">
                            <button
                              onClick={() => canEdit && handleToggleRegistration(event.id)}
                              disabled={!canEdit}
                              className={`w-full h-16 rounded-lg flex items-center justify-center transition relative ${
                                reg?.status === 'yes' ? 'bg-green-500 text-white' :
                                reg?.status === 'no' ? 'bg-red-500 text-white' :
                                'bg-gray-100'
                              } ${canEdit ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'} ${
                                locked ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                {reg?.status === 'yes' && <Check className="w-6 h-6" />}
                                {reg?.status === 'no' && <X className="w-6 h-6" />}
                                {(reg?.guests ?? 0) > 0 && (
                                  <span className="text-xs mt-1 font-bold">+{reg.guests}</span>
                                )}
                              </div>
                              {locked && (
                                <span className="absolute top-1 left-1 text-xs bg-white px-1 rounded text-gray-600">🔒</span>
                              )}
                            </button>
                            
                            {reg?.comment && (
                              <button
                                onClick={() => setCommentPopup({ 
                                  memberId: member.id, 
                                  eventId: event.id, 
                                  comment: reg.comment || '', 
                                  guests: reg.guests || 0,
                                  isOwn: isCurrentUser 
                                })}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-lg hover:scale-110 transition"
                              >
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            
                            {canEdit && (
                              <button
                                onClick={() => setCommentPopup({ 
                                  memberId: member.id, 
                                  eventId: event.id, 
                                  comment: reg?.comment || '', 
                                  guests: reg?.guests || 0,
                                  isOwn: true 
                                })}
                                className="absolute bottom-1 right-1 text-xs bg-white px-2 py-1 rounded shadow hover:bg-gray-50"
                              >
                                💬
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                
                <tr className="bg-gray-100 font-bold">
                  <td className="px-4 py-3 sticky left-0 bg-gray-100 z-10">Total Zusagen</td>
                  {events.map(e => {
                    const counts = countYes(e.id);
                    return (
                      <td key={e.id} className="px-4 py-3 text-center">
                        <div className="text-xl text-blue-600">{counts.total}</div>
                        {counts.guests > 0 && (
                          <div className="text-xs text-gray-600">
                            ({counts.members} + {counts.guests} Gäste)
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine zukünftigen Events vorhanden
          </div>
        )}

        <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Zusage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Absage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>Keine Angabe</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Gesperrt</span>
          </div>
        </div>
      </div>

      {/* Comment Popup */}
      {commentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Kommentar & Gäste</h3>
            {commentPopup.isOwn ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Anzahl Gäste</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setCommentPopup({
                        ...commentPopup, 
                        guests: Math.max(0, commentPopup.guests - 1)
                      })}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-blue-600">{commentPopup.guests}</span>
                      <div className="text-xs text-gray-500">Gäste</div>
                    </div>
                    <button
                      onClick={() => setCommentPopup({
                        ...commentPopup, 
                        guests: Math.min(10, commentPopup.guests + 1)
                      })}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Kommentar</label>
                  <textarea
                    value={commentPopup.comment}
                    onChange={(e) => setCommentPopup({...commentPopup, comment: e.target.value})}
                    placeholder="Dein Kommentar (optional)..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveComment(commentPopup.eventId, commentPopup.comment, commentPopup.guests)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setCommentPopup(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
                  >
                    Abbrechen
                  </button>
                </div>
              </>
            ) : (
              <>
                {commentPopup.guests > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Gäste:</div>
                    <div className="text-2xl font-bold text-blue-600">+{commentPopup.guests}</div>
                  </div>
                )}
                {commentPopup.comment && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Kommentar:</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{commentPopup.comment}</p>
                    </div>
                  </div>
                )}
                {!commentPopup.comment && commentPopup.guests === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4 text-center text-gray-500">
                    Kein Kommentar und keine Gäste
                  </div>
                )}
                <button
                  onClick={() => setCommentPopup(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
                >
                  Schließen
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}