'use client';

import { useState, useEffect } from 'react';
import { Calendar, LogOut, MessageSquare, Check, X, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { Member, Event, Registration } from '@/lib/supabase';
import { 
  getAllMembers, 
  getFutureEvents,
  getAllRegistrations,
  upsertRegistration,
  isEventLocked
} from '@/lib/db';
import { getCurrentSeason, getItemsForSeason, getItemKey } from '@/lib/season-config';

interface UserViewProps {
  currentUser: Member;
  onLogout: () => void;
  onSwitchView: (view: 'admin') => void;
}

const HEADER_IMAGE = '/header.png';

export default function UserView({ currentUser, onLogout, onSwitchView }: UserViewProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSeasonItems, setCurrentSeasonItems] = useState<string[]>([]);
  const [editPopup, setEditPopup] = useState<{
    memberId: number;
    memberName: string;
    eventId: number;
    eventDate: string;
    status: 'yes' | 'no' | 'pending';
    comment: string;
    guests: number;
    items: Record<string, boolean>;
    isOwn: boolean;
    locked: boolean;
  } | null>(null);

  useEffect(() => {
    loadData();
    // Load current season items
    const season = getCurrentSeason();
    setCurrentSeasonItems(getItemsForSeason(season));
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

  const handleCellClick = (member: Member, event: Event) => {
    const reg = getRegistration(member.id, event.id);
    const isOwn = member.id === currentUser.id;
    const locked = isEventLocked(event);
    
    setEditPopup({
      memberId: member.id,
      memberName: member.nickname,
      eventId: event.id,
      eventDate: new Date(event.date).toLocaleDateString('de-DE', { 
        weekday: 'short',
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric'
      }),
      status: reg?.status ?? 'pending',
      comment: reg?.comment ?? '',
      guests: reg?.guests ?? 0,
      items: reg?.items ?? {},
      isOwn,
      locked
    });
  };

  const handleSaveRegistration = async () => {
    if (!editPopup) return;
    
    if (!currentUser.is_active) {
      alert('Dein Account ist inaktiv. Du kannst keine Änderungen vornehmen.');
      return;
    }

    if (editPopup.locked) {
      alert('Event ist gesperrt (weniger als 1 Stunde bis Start)');
      return;
    }

    try {
      // Save with items
      const regData = {
        member_id: editPopup.memberId,
        event_id: editPopup.eventId,
        status: editPopup.status,
        comment: editPopup.comment || undefined,
        guests: editPopup.guests,
        items: editPopup.items
      };

      await upsertRegistration(
        regData.member_id,
        regData.event_id,
        regData.status,
        regData.comment,
        regData.guests
      );
      
      // Update local state
      const existing = getRegistration(editPopup.memberId, editPopup.eventId);
      if (existing) {
        setRegistrations(registrations.map(r =>
          r.id === existing.id 
            ? { ...r, status: editPopup.status, comment: editPopup.comment, guests: editPopup.guests, items: editPopup.items } 
            : r
        ));
      } else {
        const newReg: Registration = {
          id: Date.now(),
          member_id: editPopup.memberId,
          event_id: editPopup.eventId,
          status: editPopup.status,
          comment: editPopup.comment,
          guests: editPopup.guests,
          items: editPopup.items,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setRegistrations([...registrations, newReg]);
      }
      
      setEditPopup(null);
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

  const getItemBringers = (eventId: number, itemKey: string) => {
    return registrations
      .filter(r => r.event_id === eventId && r.status === 'yes' && r.items?.[itemKey])
      .map(r => members.find(m => m.id === r.member_id)?.nickname)
      .filter(Boolean);
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

        {/* Utensilien-Übersicht pro Event */}
        {events.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Utensilien-Übersicht</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => {
                const eventDate = new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                return (
                  <div key={event.id} className="border rounded-lg p-3">
                    <div className="font-semibold text-gray-800 mb-2">{eventDate} - {event.location}</div>
                    <div className="space-y-1 text-sm">
                      {currentSeasonItems.map(item => {
                        const itemKey = getItemKey(item);
                        const bringers = getItemBringers(event.id, itemKey);
                        return (
                          <div key={itemKey} className="flex justify-between">
                            <span className="text-gray-600">{item}:</span>
                            <span className={`font-medium ${bringers.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                              {bringers.length > 0 ? bringers.join(', ') : 'niemand'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
                      
                      return (
                        <td key={event.id} className="px-2 py-2 text-center">
                          <div className="relative">
                            <button
                              onClick={() => handleCellClick(member, event)}
                              className={`w-full h-16 rounded-lg flex items-center justify-center transition relative ${
                                reg?.status === 'yes' ? 'bg-green-500 text-white' :
                                reg?.status === 'no' ? 'bg-red-500 text-white' :
                                'bg-gray-100'
                              } ${isCurrentUser ? 'hover:opacity-80 cursor-pointer' : 'cursor-pointer'} ${
                                locked ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="flex flex-col items-center">
                                {reg?.status === 'yes' && <Check className="w-6 h-6" />}
                                {reg?.status === 'no' && <X className="w-6 h-6" />}
                                {(reg?.guests ?? 0) > 0 && (
                                  <span className="text-xs mt-1 font-bold">+{reg?.guests ?? 0}</span>
                                )}
                              </div>
                              {locked && (
                                <span className="absolute top-1 left-1 text-xs bg-white px-1 rounded text-gray-600">🔒</span>
                              )}
                            </button>
                            
                            {reg?.comment && (
                              <div className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full p-1.5 shadow-md">
                                <MessageSquare className="w-4 h-4 text-blue-600 stroke-[2.5]" />
                              </div>
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

      {/* Edit Popup */}
      {editPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              {editPopup.isOwn ? 'Deine Anmeldung' : editPopup.memberName}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{editPopup.eventDate}</p>
            
            {editPopup.isOwn && currentUser.is_active && !editPopup.locked ? (
              <>
                {/* Status Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditPopup({...editPopup, status: 'yes'})}
                      className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        editPopup.status === 'yes' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <UserCheck className="w-5 h-5" />
                      Zusage
                    </button>
                    <button
                      onClick={() => setEditPopup({...editPopup, status: 'no'})}
                      className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        editPopup.status === 'no' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <UserX className="w-5 h-5" />
                      Absage
                    </button>
                  </div>
                </div>

                {/* Utensilien Checkboxes */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Utensilien mitbringen</label>
                  <div className="space-y-2">
                    {currentSeasonItems.map(item => {
                      const itemKey = getItemKey(item);
                      return (
                        <label key={itemKey} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editPopup.items[itemKey] || false}
                            onChange={(e) => setEditPopup({
                              ...editPopup,
                              items: { ...editPopup.items, [itemKey]: e.target.checked }
                            })}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-gray-700">{item}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Guests Counter */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Anzahl Gäste</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditPopup({
                        ...editPopup, 
                        guests: Math.max(0, editPopup.guests - 1)
                      })}
                      className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-lg"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-3xl font-bold text-blue-600">{editPopup.guests}</span>
                      <div className="text-xs text-gray-500">Gäste</div>
                    </div>
                    <button
                      onClick={() => setEditPopup({
                        ...editPopup, 
                        guests: Math.min(10, editPopup.guests + 1)
                      })}
                      className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Kommentar</label>
                  <textarea
                    value={editPopup.comment}
                    onChange={(e) => setEditPopup({...editPopup, comment: e.target.value})}
                    placeholder="Dein Kommentar (optional)..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveRegistration}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditPopup(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
                  >
                    Abbrechen
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Read-only view - JEDER kann ALLE Infos sehen */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Status:</div>
                  <div className="text-lg font-bold">
                    {editPopup.status === 'yes' && <span className="text-green-600">✓ Zusage</span>}
                    {editPopup.status === 'no' && <span className="text-red-600">✗ Absage</span>}
                    {editPopup.status === 'pending' && <span className="text-gray-600">Keine Angabe</span>}
                  </div>
                </div>

                {/* Zeige Utensilien */}
                {Object.keys(editPopup.items).filter(key => editPopup.items[key]).length > 0 && (
                  <div className="mb-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Bringt mit:</div>
                    <div className="space-y-1">
                      {currentSeasonItems.map(item => {
                        const itemKey = getItemKey(item);
                        if (editPopup.items[itemKey]) {
                          return (
                            <div key={itemKey} className="flex items-center gap-2 text-green-700">
                              <Check className="w-4 h-4" />
                              <span>{item}</span>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
                
                {editPopup.guests > 0 && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Gäste:</div>
                    <div className="text-2xl font-bold text-blue-600">+{editPopup.guests}</div>
                  </div>
                )}
                
                {editPopup.comment && (
                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-700 mb-1">Kommentar:</div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{editPopup.comment}</p>
                    </div>
                  </div>
                )}
                
                {!editPopup.comment && editPopup.guests === 0 && Object.keys(editPopup.items).filter(k => editPopup.items[k]).length === 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg mb-4 text-center text-gray-500">
                    Keine zusätzlichen Infos
                  </div>
                )}
                
                {editPopup.locked && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">🔒 Event ist gesperrt</p>
                  </div>
                )}
                
                <button
                  onClick={() => setEditPopup(null)}
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
