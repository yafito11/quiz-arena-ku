import React from 'react';
import type { ThemedLeaderboardProps } from '../LeaderboardScreen';
import Button from '../common/Button';
import Card from '../common/Card';

const MountainClimbLeaderboard: React.FC<ThemedLeaderboardProps> = ({ room, user, nextQuestion, resetGame, exitDemo }) => {
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const isGameOver = room.status === 'finished' || room.isDemo;
    const topScore = Math.max(1000, ...room.players.map(p => p.score));

    return (
        <Card className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                {isGameOver ? "Reached the Summit!" : "Mountain Climb!"}
            </h2>
            <p className="text-center text-gray-400 mb-6">Climb higher than your opponents by answering correctly!</p>
            
            <div className="relative h-[500px] p-4 bg-mountain-pattern rounded-lg flex justify-around items-end overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl" title="Summit">🚩</div>
            
                {sortedPlayers.map((player, index) => {
                    const progress = Math.min(100, (player.score / topScore) * 100);
                    const lastUpdate = room.lastAnswerUpdate;
                    const justScored = lastUpdate && lastUpdate.playerId === player.id;
                    const horizontalPosition = `${(index + 1) * (100 / (sortedPlayers.length + 1))}%`;

                    return (
                        <div 
                            key={player.id} 
                            className={`absolute transition-all duration-1000 ease-out flex flex-col items-center text-center ${justScored ? 'animate-pulse-highlight' : ''}`}
                            style={{ 
                                bottom: `calc(${progress * 0.8}% - 32px)`,
                                left: horizontalPosition,
                                transform: 'translateX(-50%)'
                            }}
                        >
                             <div className="bg-gray-900/70 p-1 rounded-md mb-1">
                                <p className="font-bold text-sm text-white truncate">{player.name}</p>
                                <p className="text-xs text-brand-secondary font-semibold">{player.score.toLocaleString()}</p>
                            </div>
                            <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-300" />
                             <span className="text-3xl">🧗</span>
                        </div>
                    );
                })}
            </div>
             <div className="flex justify-center mt-8">
                 {user.isHost ? (
                    isGameOver ? (
                      room.isDemo ? (
                        <Button onClick={exitDemo} variant="success" className="w-full sm:w-auto text-lg">End Demo</Button>
                      ) : (
                        <Button onClick={resetGame} variant="secondary" className="w-full sm:w-auto text-lg">Climb Again</Button>
                      )
                    ) : (
                        <Button onClick={nextQuestion} className="w-full sm:w-auto text-lg">Continue Climb</Button>
                    )
                ) : (
                    <p className="text-center text-gray-400">{isGameOver ? "Expedition Over!" : "Waiting for host..."}</p>
                )}
            </div>
        </Card>
    );
};

export default MountainClimbLeaderboard;