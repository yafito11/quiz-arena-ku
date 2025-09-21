import React, { useState } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';

interface JoinScreenProps {
  joinRoom: (roomCode: string, playerName: string, playerBio?: string) => void;
  goBack: () => void;
  initialRoomCode?: string;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ joinRoom, goBack, initialRoomCode }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [bio, setBio] = useState('');

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      alert('Please enter your name and a room code.');
      return;
    }
    joinRoom(roomCode, playerName, bio);
  };

  return (
    <Card className="max-w-md mx-auto animate-slide-in-up">
      <h2 className="text-3xl font-bold mb-6 text-center">Join a Game</h2>
      <div className="space-y-4">
        <Input 
          label="Your Name" 
          placeholder="Enter your name" 
          value={playerName} 
          onChange={(e) => setPlayerName(e.target.value)} 
          maxLength={20}
        />
        <Input 
          label="Short Bio (Optional)" 
          placeholder="Tell everyone a bit about yourself" 
          value={bio} 
          onChange={(e) => setBio(e.target.value)} 
          maxLength={100}
        />
        <Input
          label="Room Code"
          placeholder="123456"
          value={roomCode}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');
            setRoomCode(numericValue);
          }}
          maxLength={6}
          className="text-3xl font-mono font-bold text-center tracking-[0.4em] bg-gray-800/60 p-3"
        />
      </div>
      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={goBack}>Back</Button>
        <Button onClick={handleJoin}>Join Room</Button>
      </div>
    </Card>
  );
};

export default JoinScreen;