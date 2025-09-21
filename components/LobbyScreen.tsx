import React from 'react';
import type { Room, User } from '../types';
import Button from './common/Button';
import Card from './common/Card';

declare var QRCode: any;

interface LobbyScreenProps {
  room: Room;
  user: User;
  startGame: () => void;
  goBack: () => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ room, user, startGame, goBack }) => {
  const [copied, setCopied] = React.useState(false);
  const shareLink = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
  const qrCodeRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (qrCodeRef.current && shareLink && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(qrCodeRef.current, shareLink, { width: 128, margin: 1, color: { dark: '#000000', light: '#FFFFFF' } }, (error: any) => {
        if (error) console.error('Error generating QR Code:', error);
      });
    }
  }, [shareLink]);


  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link.');
      });
  };

  return (
    <Card className="max-w-3xl mx-auto animate-slide-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <div>
          <h2 className="text-3xl font-bold">{room.name}</h2>
          <p className="text-gray-400">Waiting for players to join...</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">ROOM CODE</p>
          <p className="text-2xl font-bold tracking-widest bg-gray-900/50 px-3 py-1 rounded-md">{room.code}</p>
        </div>
      </div>

      <div className="my-6 p-4 bg-gray-900/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-center text-emerald-400">Invite Players</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <div className="flex-1 w-full max-w-sm">
                <p className="text-sm text-gray-400 mb-1">Copy invite link:</p>
                <div className="flex gap-2">
                    <input type="text" readOnly value={shareLink} className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500" />
                    <Button onClick={handleCopyLink} variant="secondary">
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
                <p className="text-sm text-gray-400 mb-2">Or scan QR code:</p>
                <div className="p-2 bg-white rounded-lg shadow-md">
                    <canvas ref={qrCodeRef}></canvas>
                </div>
            </div>
        </div>
      </div>

      <div className="my-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Players ({room.players.length} / {room.maxPlayers})</h3>
         {room.players.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {room.players.map(player => (
                <div key={player.id} className="flex flex-col items-center text-center p-3 bg-gray-800/50 rounded-lg">
                <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-16 h-16 rounded-full mb-2 border-2 border-gray-500" />
                <p className="font-semibold truncate w-full">{player.name}</p>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-center text-gray-400 italic">No players have joined yet.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
        <Button variant="secondary" onClick={goBack} className="w-full sm:w-auto">
          {user.isHost ? 'Back to Dashboard' : 'Leave Room'}
        </Button>
        {user.isHost ? (
          <div className="flex flex-col items-center w-full sm:w-auto">
            <Button onClick={startGame} disabled={room.players.length < 1} className="w-full sm:w-auto">
              Start Game
            </Button>
            {room.players.length < 1 && (
              <p className="text-center text-yellow-500 mt-2 text-sm">You need at least 1 player to start.</p>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-400">Waiting for the host to start the game...</p>
        )}
      </div>
    </Card>
  );
};

export default LobbyScreen;