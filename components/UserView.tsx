 'use client';

import { useState, useEffect } from 'react';
import { LogOut, MessageSquare, Check, X, AlertCircle, UserCheck, UserX } from 'lucide-react';
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
        day: '2-digit', 
        month: '2-digit'
      }) + ' ' + event.time_from + '-' + event.time_to + ' ' + event.location,
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
      await upsertRegistration(
        editPopup.memberId,
        editPopup.eventId,
        editPopup.status,
        editPopup.comment || undefined,
        editPopup.guests,
        editPopup.items
      );
      
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
          <h1 className="text-xl font-semibold text-gray-800">Anmeldung</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              <span className="font-semibold">{currentUser.nickname}</span>
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

      <div className="max-w-7xl mx-auto p-4">
        {!currentUser.is_active && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 text-sm">Account inaktiv</h3>
              <p className="text-xs text-yellow-700">
                Du kannst die Events sehen, aber keine Änderungen vornehmen.
              </p>
            </div>
          </div>
        )}

        {/* Utensilien-Übersicht - Horizontal wie im Screenshot */}
        {events.length > 0 && (
          <div className="mb-4">
            {events.map(event => {
              const eventDate = new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
              return (
                <div key={event.id} className="mb-6">
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    {/* Event Header */}
                    <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-800 text-sm">
                      {eventDate} {event.time_from}-{event.time_to} {event.location}
                    </div>
                    
                    {/* Utensilien Tabelle */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-50">Spieler</th>
                            {sortedMembers.map(m => (
                              <th key={m.id} className="px-2 py-2 text-center text-xs font-medium text-gray-600 bg-gray-50">
                                {m.nickname}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentSeasonItems.map(item => {
                            const itemKey = getItemKey(item);
                            return (
                              <tr key={itemKey} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-700">{item}</td>
                                {sortedMembers.map(member => {
                                  const reg = getRegistration(member.id, event.id);
                                  const hasBringer = reg?.items?.[itemKey];
                                  return (
                                    <td key={member.id} className="px-2 py-2 text-center">
                                      {hasBringer ? (
                                        <span className="text-green-600 font-bold text-lg">{member.nickname}</span>
                                      ) : (
                                        <span className="text-gray-300">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Spieler Status */}
                    <div className="p-4 space-y-2">
                      {sortedMembers.map(member => {
                        const reg = getRegistration(member.id, event.id);
                        const isCurrentUser = member.id === currentUser.id;
                        const locked = isEventLocked(event);
                        
                        return (
                          <div 
                            key={member.id}
                            onClick={() => handleCellClick(member, event)}
                            className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                              isCurrentUser ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex-1 font-semibold text-gray-800">
                              {member.nickname}
                              {isCurrentUser && <span className="ml-2 text-blue-600 text-xs">(Du)</span>}
                            </div>
                            
                            {/* Status Buttons */}
                            <div className="flex items-center gap-2">
                              {reg?.comment && (
                                <div className="relative">
                                  <MessageSquare className="w-5 h-5 text-blue-600 stroke-[2.5]" />
                                </div>
                              )}
                              
                              {reg?.guests > 0 && (
                                <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold text-xs">
                                  +{reg.guests}
                                </div>
                              )}
                              
                              {reg?.status === 'yes' && (
                                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
                                  <Check className="w-8 h-8 text-white" />
                                </div>
                              )}
                              
                              {reg?.status === 'no' && (
                                <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center">
                                  <X className="w-8 h-8 text-white" />
                                </div>
                              )}
                              
                              {reg?.status === 'pending' && (
                                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                              )}
                              
                              {locked && (
                                <span className="text-xs text-gray-500">🔒</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine zukünftigen Events vorhanden
          </div>
        )}
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
                {/* Read-only view */}
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Status:</div>
                  <div className="text-lg font-bold">
                    {editPopup.status === 'yes' && <span className="text-green-600">✓ Zusage</span>}
                    {editPopup.status === 'no' && <span className="text-red-600">✗ Absage</span>}
                    {editPopup.status === 'pending' && <span className="text-gray-600">Keine Angabe</span>}
                  </div>
                </div>

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
