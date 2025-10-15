'use client';

import { useState, useEffect } from 'react';
import { LogOut, MessageSquare, Check, X, AlertCircle } from 'lucide-react';
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
      }) + ' ' + event.time_from.substring(0, 5) + '-' + event.time_to.substring(0, 5) + ' ' + event.location,
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

  const countTotal = (eventId: number) => {
    const allRegs = registrations.filter(r => r.event_id === eventId && (r.status === 'yes' || r.status === 'no'));
    const memberCount = registrations.filter(r => r.event_id === eventId && r.status === 'yes').length;
    const guestCount = allRegs.reduce((sum, r) => sum + (r.guests || 0), 0);
    return { members: memberCount, guests: guestCount, total: memberCount + guestCount };
  };

  const sortedMembers = [...members].sort((a, b) => a.nickname.localeCompare(b.nickname));

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Lädt...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mit Bild - 49px hoch - FIXED */}
<div className="bg-ktv-red h-[49px] w-screen relative left-1/2 right-1/2 -mx-[50vw]">
  <div className="max-w-7xl mx-auto px-4 h-full flex items-center">
    <img 
      src={HEADER_IMAGE} 
      alt="KTV Fussball" 
      className="h-[49px] object-contain object-left"
    />
  </div>
</div>
      
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Anmeldung</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-gray-700">{currentUser.nickname}</span>
            {currentUser.is_admin && (
              <button
                onClick={() => onSwitchView('admin')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium"
              >
                Admin-Bereich
              </button>
            )}
            <button onClick={onLogout} className="text-gray-600 hover:text-gray-800 transition">
              <LogOut className="w-6 h-6" />
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

        {events.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden inline-block">
            <div className="overflow-x-auto">
              <div>
                <table className="border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left font-bold text-gray-900 bg-gray-50 sticky left-0 z-10 w-32"></th>
                      {events.map(event => (
                        <th key={event.id} className="px-6 py-3 text-center bg-gray-50 w-40">
                          <div className="font-bold text-gray-900 text-base">
                            {new Date(event.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                          </div>
                          <div className="text-sm text-gray-600 font-normal">
                            {event.time_from.substring(0, 5)}-{event.time_to.substring(0, 5)}
                          </div>
                          <div className="text-sm text-gray-500 font-normal">
                            {event.location}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSeasonItems.map((item) => {
                      const itemKey = getItemKey(item);
                      return (
                        <tr key={itemKey} className="border-b bg-yellow-50">
                          <td className="px-4 py-3 font-semibold text-gray-900 sticky left-0 z-10 bg-yellow-50 w-32">
                            {item}
                          </td>
                          {events.map(event => {
                            const bringers = sortedMembers
                              .filter(m => {
                                const reg = getRegistration(m.id, event.id);
                                return reg?.status === 'yes' && reg?.items?.[itemKey];
                              })
                              .map(m => m.nickname);
                            
                            return (
                              <td key={event.id} className="px-6 py-3 text-center w-40">
                                {bringers.length > 0 ? (
                                  <span className="font-bold text-green-600 text-base">
                                    {bringers.join(', ')}
                                  </span>
                                ) : (
                                  <span className="text-gray-300 text-xl">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t-4 border-gray-300">
                  <table className="border-collapse">
                    <tbody>
                      {sortedMembers.map(member => {
                        const isCurrentUser = member.id === currentUser.id;
                        return (
                          <tr key={member.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-4 font-bold text-gray-900 text-lg sticky left-0 bg-white z-10 w-32">
                              {member.nickname}
                              {isCurrentUser && (
                                <span className="ml-2 text-blue-600 text-base">(Du)</span>
                              )}
                            </td>
                            {events.map(event => {
                              const reg = getRegistration(member.id, event.id);
                              const locked = isEventLocked(event);
                              
                              return (
                                <td key={event.id} className="px-2 py-2 text-center w-40">
                                  <button
                                    onClick={() => handleCellClick(member, event)}
                                    className="relative w-full"
                                  >
                                    {reg?.status === 'yes' && (
                                      <div className="bg-green-500 rounded-lg p-4 flex items-center justify-center gap-2 relative">
                                        <Check className="w-8 h-8 text-white stroke-[3]" />
                                        {reg.comment && (
                                          <MessageSquare className="w-5 h-5 text-white absolute top-2 right-2" />
                                        )}
                                        {reg.guests > 0 && (
                                          <span className="absolute bottom-2 right-2 text-white font-bold text-sm">
                                            +{reg.guests}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {reg?.status === 'no' && (
                                      <div className="bg-red-500 rounded-lg p-4 flex items-center justify-center gap-2 relative">
                                        <X className="w-8 h-8 text-white stroke-[3]" />
                                        {reg.comment && (
                                          <MessageSquare className="w-5 h-5 text-white absolute top-2 right-2" />
                                        )}
                                        {reg.guests > 0 && (
                                          <span className="absolute bottom-2 right-2 text-white font-bold text-sm">
                                            +{reg.guests}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    
                                    {(!reg || reg.status === 'pending') && (
                                      <div className="bg-gray-100 rounded-lg p-4 h-16"></div>
                                    )}
                                    
                                    {locked && (
                                      <span className="absolute top-1 left-1 text-xs">🔒</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t-2 border-gray-400 bg-gray-50">
                  <table className="border-collapse">
                    <tbody>
                      <tr>
                        <td className="px-4 py-3 font-bold text-gray-900 text-lg sticky left-0 bg-gray-50 z-10 w-32">
                          Total
                        </td>
                        {events.map(event => {
                          const counts = countTotal(event.id);
                          return (
                            <td key={event.id} className="px-6 py-3 text-center w-40">
                              <div className="font-bold text-blue-600 text-xl">
                                {counts.total}
                              </div>
                              <div className="text-xs text-gray-600">
                                ({counts.members} + {counts.guests})
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditPopup({...editPopup, status: 'yes'})}
                      className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                        editPopup.status === 'yes' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Check className="w-5 h-5" />
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
                      <X className="w-5 h-5" />
                      Absage
                    </button>
                  </div>
                </div>

                <div className="mb-4">
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

                <div className="mb-4">
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
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Kommentar</label>
                  <textarea
                    value={editPopup.comment}
                    onChange={(e) => setEditPopup({...editPopup, comment: e.target.value})}
                    placeholder="Dein Kommentar (optional)..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  />
                </div>
                
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
