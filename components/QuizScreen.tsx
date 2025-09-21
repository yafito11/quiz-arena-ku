import React, { useState, useEffect, useMemo } from 'react';
import type { Room, User } from '../types';
import { ConfidenceLevel } from '../types';
import Button from './common/Button';
import Card from './common/Card';

const QUESTION_TIME = 20; // seconds

interface QuizScreenProps {
  room: Room;
  user: User;
  submitAnswer: (playerId: string, selectedOption: string, confidence: ConfidenceLevel) => void;
  showLeaderboard: () => void;
}

const confidenceOptions = {
    [ConfidenceLevel.Cautious]: { label: 'Hati-hati', description: '50% Poin, 0 Penalti', color: 'bg-sky-600', hover: 'hover:bg-sky-500' },
    [ConfidenceLevel.Normal]: { label: 'Normal', description: '100% Poin, 0 Penalti', color: 'bg-indigo-600', hover: 'hover:bg-indigo-500' },
    [ConfidenceLevel.Confident]: { label: 'Yakin', description: '200% Poin, -500 Penalti', color: 'bg-rose-600', hover: 'hover:bg-rose-500' },
};

const QuizScreen: React.FC<QuizScreenProps> = ({ room, user, submitAnswer, showLeaderboard }) => {
  const [timer, setTimer] = useState(QUESTION_TIME);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>(ConfidenceLevel.Normal);
  const [showDemoTooltip, setShowDemoTooltip] = useState(room.isDemo);

  const currentQuestion = room.quiz[room.currentQuestionIndex];
  const isSpectator = !room.players.find(p => p.id === user.id);

  useEffect(() => {
    setSelectedAnswer(null);
    setTimer(QUESTION_TIME);
    setConfidence(ConfidenceLevel.Normal);
  }, [currentQuestion]);

  useEffect(() => {
    if (timer > 0 && selectedAnswer === null) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0 && selectedAnswer === null) {
        setSelectedAnswer("TIME_OUT");
        setTimeout(showLeaderboard, 2000);
    }
  }, [timer, selectedAnswer, showLeaderboard]);
  
  const handleAnswerClick = (option: string) => {
    if (selectedAnswer !== null || isSpectator) return;
    
    setSelectedAnswer(option);
    
    const currentPlayer = room.players.find(p => p.id === user.id);
    if (currentPlayer) {
        submitAnswer(currentPlayer.id, option, confidence);
    }

    setTimeout(showLeaderboard, 2000);
  };

  const getButtonVariant = (option: string): 'primary' | 'success' | 'danger' => {
      if (selectedAnswer === null) return 'primary';
      if (option === currentQuestion.correctAnswer) return 'success';
      if (option === selectedAnswer) return 'danger';
      return 'primary';
  };

  const timerWidth = useMemo(() => `${(timer / QUESTION_TIME) * 100}%`, [timer]);

  return (
    <Card className="max-w-3xl mx-auto animate-fade-in relative">
        {showDemoTooltip && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 rounded-xl p-4 text-center">
                <h3 className="text-2xl font-bold text-emerald-400 mb-3">Welcome to the Demo!</h3>
                <p className="mb-4">This is the **Confidence System**. Answering correctly is only half the battle!</p>
                <ul className="text-left space-y-2 mb-4 list-disc list-inside">
                    <li><b className="text-rose-400">Yakin:</b> Go for double points, but be careful! A wrong answer costs you.</li>
                    <li><b className="text-indigo-400">Normal:</b> The standard, balanced choice.</li>
                    <li><b className="text-sky-400">Hati-hati:</b> Play it safe for fewer points with no penalty for wrong answers.</li>
                </ul>
                <p className="mb-6">Choose your confidence, then select an answer below.</p>
                <Button onClick={() => setShowDemoTooltip(false)}>Got It!</Button>
            </div>
        )}
        <div className="mb-4">
            <div className="flex justify-between items-baseline text-gray-300 mb-2">
                <span className="text-sm sm:text-base">Question {room.currentQuestionIndex + 1} / {room.quiz.length}</span>
                <span className="font-bold text-xl sm:text-2xl">{timer}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div className="bg-brand-secondary h-2.5 rounded-full transition-all duration-1000 linear" style={{ width: timerWidth }}></div>
            </div>
        </div>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold my-6 text-center" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />

      {!isSpectator && (
        <div className="mb-6">
            <p className="text-center text-gray-400 mb-3">Pilih tingkat kepercayaan dirimu:</p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                {Object.entries(confidenceOptions).map(([key, value]) => (
                    <button 
                        key={key}
                        onClick={() => setConfidence(key as ConfidenceLevel)}
                        disabled={selectedAnswer !== null}
                        className={`flex-1 p-3 rounded-lg text-center transition-all border-2 disabled:opacity-50
                            ${confidence === key ? `${value.color} border-white scale-105` : `bg-gray-800 border-gray-600 ${value.hover}`}`}
                    >
                        <span className="font-bold">{value.label}</span>
                        <span className="text-xs block opacity-80">{value.description}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={selectedAnswer !== null || isSpectator}
            variant={getButtonVariant(option)}
            className={`h-full whitespace-normal text-base sm:text-lg py-3 sm:py-4 ${selectedAnswer !== null && option !== currentQuestion.correctAnswer && option !== selectedAnswer ? 'opacity-50' : ''}`}
          >
            <span dangerouslySetInnerHTML={{ __html: option }} />
          </Button>
        ))}
      </div>
      {isSpectator && <p className="text-center mt-6 text-yellow-400">You are spectating.</p>}
    </Card>
  );
};

export default QuizScreen;