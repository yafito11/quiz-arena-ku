import React, { useState, useEffect } from 'react';
import type { Room } from '../types';
import Button from './common/Button';
import Card from './common/Card';

interface HostDashboardProps {
  rooms: Room[];
  createNewRoom: () => void;
  viewLobby: (roomCode: string) => void;
  deleteRoom: (roomId: string) => void;
  spectateRoom: (roomCode: string) => void;
  goBack: () => void;
}

const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000;

const formatTimeRemaining = (createdAt: number) => {
    const timeLeft = (createdAt + FOUR_HOURS_IN_MS) - Date.now();
    if (timeLeft <= 0) return 'Expired';
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
};

const HostDashboard: React.FC<HostDashboardProps> = ({ rooms, createNewRoom, viewLobby, deleteRoom, spectateRoom, goBack }) => {
  // State to force re-render for the timer
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(tick => tick + 1), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="max-w-4xl mx-auto animate-slide-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Host Dashboard</h2>
          <p className="text-gray-400">Manage your active quiz rooms.</p>
        </div>
        <Button onClick={createNewRoom} variant="secondary">
          + Create New Room
        </Button>
      </div>

      {rooms.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-900/50 text-gray-300">
              <tr>
                <th className="p-3">Room Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Players</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expires In</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="p-3 font-semibold">{room.name}</td>
                  <td className="p-3 font-mono tracking-widest">{room.code}</td>
                  <td className="p-3">
                    <span className="inline-block bg-gray-700 text-gray-200 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {room.players.length} / {room.maxPlayers}
                    </span>
                  </td>
                  <td className="p-3 capitalize">{room.status.replace('_', ' ')}</td>
                  <td className="p-3 text-sm text-gray-400">{formatTimeRemaining(room.createdAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Button onClick={() => viewLobby(room.code)} className="px-3 py-1 text-sm">
                        View
                      </Button>
                      {(room.status === 'in_progress' || room.status === 'finished') && (
                        <Button onClick={() => spectateRoom(room.code)} variant="secondary" className="px-3 py-1 text-sm">
                          Spectate
                        </Button>
                      )}
                      <Button onClick={() => deleteRoom(room.id)} variant="danger" className="px-3 py-1 text-sm">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold">No active rooms</h3>
          <p className="text-gray-400 mt-2">Click "Create New Room" to get started!</p>
        </div>
      )}
      <div className="mt-8 flex justify-start">
        <Button onClick={goBack} variant="secondary">Exit Host Mode</Button>
      </div>
    </Card>
  );
};

export default HostDashboard;