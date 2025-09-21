import React from 'react';
import type { ThemedLeaderboardProps } from '../LeaderboardScreen';
import Button from '../common/Button';
import Card from '../common/Card';

const SpaceRaceLeaderboard: React.FC<ThemedLeaderboardProps> = ({ room, user, nextQuestion, resetGame, exitDemo }) => {
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const isGameOver = room.status === 'finished' || room.isDemo;
    const topScore = Math.max(1000, ...room.players.map(p => p.score));

    return (
        <Card className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                {isGameOver ? "Mission Complete!" : "Space Race!"}
            </h2>
            <p className="text-center text-gray-400 mb-6">Race your rocket to the planet by scoring points!</p>
            
            <div className="relative h-[500px] p-4 bg-gray-900 bg-star-pattern rounded-lg flex justify-around items-end overflow-hidden">
                {/* Planet at the top */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">Mars</div>
            
                {sortedPlayers.map((player, index) => {
                    const progress = Math.min(100, (player.score / topScore) * 100);
                    const lastUpdate = room.lastAnswerUpdate;
                    const justScored = lastUpdate && lastUpdate.playerId === player.id;

                    // Distribute players horizontally
                    const horizontalPosition = `${(index + 1) * (100 / (sortedPlayers.length + 1))}%`;

                    return (
                        <div 
                            key={player.id} 
                            className={`absolute transition-all duration-1000 ease-out flex flex-col items-center ${justScored ? 'animate-pulse-highlight' : ''}`}
                            style={{ 
                                bottom: `calc(${progress * 0.8}% - 32px)`, // Use 80% of height for better visuals
                                left: horizontalPosition,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <span className="text-4xl animate-bounce">🚀</span>
                            <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-12 h-12 rounded-full my-1 bg-gray-600 border-2 border-blue-300" />
                            <div className="bg-gray-900/70 p-1 rounded-md text-center">
                                <p className="font-bold text-sm text-white truncate">{player.name}</p>
                                <p className="text-xs text-brand-secondary font-semibold">{player.score.toLocaleString()}</p>
                            </div>
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
                        <Button onClick={resetGame} variant="secondary" className="w-full sm:w-auto text-lg">New Mission</Button>
                      )
                    ) : (
                        <Button onClick={nextQuestion} className="w-full sm:w-auto text-lg">Next Stage</Button>
                    )
                ) : (
                    <p className="text-center text-gray-400">{isGameOver ? "You've Landed!" : "Waiting for host..."}</p>
                )}
            </div>
        </Card>
    );
};

export default SpaceRaceLeaderboard;