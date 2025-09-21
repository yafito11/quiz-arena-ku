import React from 'react';
import type { ThemedLeaderboardProps } from '../LeaderboardScreen';
import Button from '../common/Button';
import Card from '../common/Card';
import { ConfidenceLevel, type Room } from '../../types';

const DefaultLeaderboard: React.FC<ThemedLeaderboardProps> = ({ room, user, nextQuestion, resetGame, exitDemo }) => {
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  const isGameOver = room.status === 'finished' || room.isDemo;

  const getRankColor = (index: number) => {
    if (index === 0) return 'border-yellow-400 bg-yellow-400/10';
    if (index === 1) return 'border-gray-400 bg-gray-400/10';
    if (index === 2) return 'border-amber-600 bg-amber-600/10';
    return 'border-gray-700';
  }
  
  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  }

  const renderScoreUpdate = (lastUpdate: NonNullable<Room['lastAnswerUpdate']>) => {
    const { scoreGained, confidenceUsed, streakBonus } = lastUpdate;
    const isConfident = confidenceUsed === ConfidenceLevel.Confident;
    const isCautious = confidenceUsed === ConfidenceLevel.Cautious;

    const scoreColor = scoreGained > 0 ? 'text-green-400' : 'text-red-400';

    return (
      <div className="absolute -top-6 right-0 text-lg font-bold animate-fade-out-up flex flex-col items-end">
        <span className={scoreColor}>{scoreGained > 0 ? '+' : ''}{scoreGained.toLocaleString()}</span>
        <div className="flex items-center gap-2 text-xs font-normal">
          {isConfident && <span className="text-rose-400">Yakin!</span>}
          {isCautious && <span className="text-sky-400">Hati-hati</span>}
          {streakBonus > 0 && <span className="text-orange-400">Streak +{streakBonus}</span>}
        </div>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
        {isGameOver ? (room.isDemo ? "Demo Results!" : "Final Results!") : "Leaderboard"}
      </h2>
      
      <ul className="space-y-3 mb-8">
        {sortedPlayers.map((player, index) => {
          const lastUpdate = room.lastAnswerUpdate;
          const justScored = lastUpdate && lastUpdate.playerId === player.id;
          
          return (
            <li
              key={player.id}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border-2 transition-all transform hover:scale-105 ${getRankColor(index)} ${justScored ? 'animate-pulse-highlight' : ''}`}
            >
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-xl sm:text-2xl font-bold w-8 sm:w-10 text-center">{getRankIcon(index)}</span>
                <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-600 border-2 border-gray-500" />
                <div>
                  <span className={`text-lg sm:text-xl font-semibold ${player.id === user.id ? 'text-brand-secondary' : ''}`}>{player.name} {player.id === user.id ? '(You)' : ''}</span>
                  {player.bio && <p className="text-xs text-gray-400 italic">"{player.bio}"</p>}
                </div>
              </div>
              <div className="text-right relative">
                  <span className="text-xl sm:text-2xl font-bold text-white">{player.score.toLocaleString()}</span>
                  {justScored && renderScoreUpdate(lastUpdate)}
                  {player.streak > 1 && !justScored && <span className="text-xs sm:text-sm text-orange-400 ml-1 sm:ml-2">🔥 {player.streak}</span>}
              </div>
            </li>
          );
        })}
      </ul>

      {user.isHost ? (
        isGameOver ? (
          room.isDemo ? (
            <Button onClick={exitDemo} variant="success" className="w-full text-base sm:text-lg">End Demo</Button>
          ) : (
            <Button onClick={resetGame} variant="secondary" className="w-full text-base sm:text-lg">Play Again</Button>
          )
        ) : (
          <Button onClick={nextQuestion} className="w-full text-base sm:text-lg">Next Question</Button>
        )
      ) : (
        <p className="text-center text-gray-400">{isGameOver ? "Game Over!" : "Waiting for host..."}</p>
      )}
    </Card>
  );
};

export default DefaultLeaderboard;