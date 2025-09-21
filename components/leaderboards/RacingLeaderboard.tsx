import React, { useState } from 'react';
import type { ThemedLeaderboardProps } from '../LeaderboardScreen';
import Button from '../common/Button';
import Card from '../common/Card';

const RacingLeaderboard: React.FC<ThemedLeaderboardProps> = ({ room, user, nextQuestion, resetGame, exitDemo }) => {
    const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
    const isGameOver = room.status === 'finished' || room.isDemo;
    const topScore = Math.max(1000, ...room.players.map(p => p.score));
    const [showDemoTooltip, setShowDemoTooltip] = useState(room.isDemo);

    return (
        <Card className="max-w-4xl mx-auto relative">
            {showDemoTooltip && (
                 <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-xl p-4 text-center">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-3">Check the Race!</h3>
                    <p className="mb-4">Your car's position is based on your total score. Notice how the AI players have different scores?</p>
                    <p className="mb-6">That's the **Confidence System** in action! A "Confident" correct answer gave Gizmo a huge boost, while Bolt's "Cautious" choice gave fewer points.</p>
                    <Button onClick={() => setShowDemoTooltip(false)}>Awesome!</Button>
                </div>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
                {isGameOver ? (room.isDemo ? "Demo Lap!" : "Final Lap!") : "Finish Line!"}
            </h2>
             <p className="text-center text-gray-400 mb-6">Players race to the finish line based on their score.</p>
            
            <div className="relative p-4 space-y-2 bg-gray-700 rounded-lg overflow-hidden border-l-4 border-r-4 border-gray-500">
                <div 
                    className="absolute top-0 h-full w-4 right-0" 
                    style={{ background: 'repeating-linear-gradient(0deg, #333, #333 10px, #fff 10px, #fff 20px)'}}
                    title="Finish Line"
                ></div>

                {sortedPlayers.map((player, index) => {
                    const progress = Math.min(100, (player.score / topScore) * 100);
                    const lastUpdate = room.lastAnswerUpdate;
                    const justScored = lastUpdate && lastUpdate.playerId === player.id;
                    return (
                        <div key={player.id} className="relative h-16 rounded-lg flex items-center pr-8">
                           {/* Player car */}
                            <div 
                                className={`absolute top-0 transition-all duration-1000 ease-out flex items-center gap-3 p-2 rounded-lg ${justScored ? 'animate-pulse-highlight' : ''}`}
                                style={{ left: `calc(${progress}% - 48px)` }}
                            >
                                <img src={player.avatar} alt={`${player.name}'s avatar`} className="w-12 h-12 rounded-full bg-gray-600 border-2 border-gray-400" />
                                <div className={`bg-gray-900/70 p-1 rounded-md text-center ${player.id === user.id ? 'ring-2 ring-brand-secondary' : ''}`}>
                                    <p className="font-bold text-sm truncate">{player.name}</p>
                                    <p className="text-xs text-brand-secondary font-semibold">{player.score.toLocaleString()}</p>
                                </div>
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
                        <Button onClick={resetGame} variant="secondary" className="w-full sm:w-auto text-lg">Race Again</Button>
                      )
                    ) : (
                        <Button onClick={nextQuestion} className="w-full sm:w-auto text-lg">Next Lap</Button>
                    )
                ) : (
                    <p className="text-center text-gray-400">{isGameOver ? "Race Over!" : "Waiting for host..."}</p>
                )}
            </div>
        </Card>
    );
};

export default RacingLeaderboard;