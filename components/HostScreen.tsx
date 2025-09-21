import React, { useState } from 'react';
import { Question, LeaderboardTheme, QuizLanguage } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import Spinner from './common/Spinner';
import { generateQuiz } from '../services/geminiService';

interface HostScreenProps {
  createRoom: (roomName: string, maxPlayers: number, quiz: Question[], theme: LeaderboardTheme, language: QuizLanguage) => void;
  goBack: () => void;
}

const themeOptions: Record<LeaderboardTheme, { name: string, icon: string }> = {
  [LeaderboardTheme.DEFAULT]: { name: 'Classic', icon: '📊' },
  [LeaderboardTheme.RACING]: { name: 'Finish Line', icon: '🏎️' },
  [LeaderboardTheme.SPACE_RACE]: { name: 'Space Race', icon: '🚀' },
  [LeaderboardTheme.MOUNTAIN_CLIMB]: { name: 'Mountain Climb', icon: '🧗' },
};

const HostScreen: React.FC<HostScreenProps> = ({ createRoom, goBack }) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [theme, setTheme] = useState<LeaderboardTheme>(LeaderboardTheme.DEFAULT);
  const [language, setLanguage] = useState<QuizLanguage>(QuizLanguage.ENGLISH);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name.');
      return;
    }

    if (!topic.trim()) {
      alert('Please enter a topic for the quiz.');
      return;
    }
    setIsLoading(true);
    const questions = await generateQuiz(topic, numQuestions, language);
    setIsLoading(false);
    if (questions && questions.length > 0) {
      createRoom(roomName, maxPlayers, questions, theme, language);
    } else {
      alert('Could not generate quiz. Please try a different topic or check your API key.');
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <Spinner message={`Generating a ${numQuestions}-question quiz about "${topic}" in ${language}...`} />
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto animate-slide-in-up">
      <h2 className="text-3xl font-bold mb-6 text-center">Create a New Game</h2>
      <div className="space-y-4">
        <Input label="Room Name" placeholder="e.g., Friday Night Trivia" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
        <Input
          label="Max Players"
          type="number"
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Math.max(2, parseInt(e.target.value, 10) || 2))}
          min="2"
          placeholder="e.g., 8"
        />
        
        <div className="pt-4 border-t border-gray-700">
           <h3 className="text-xl font-semibold mb-2 text-center text-emerald-400">Quiz Generation</h3>
           <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg">
             <Input label="Topic" placeholder="e.g., 1990s Movies, World Capitals" value={topic} onChange={(e) => setTopic(e.target.value)} />
             <Input
                label="Number of Questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                placeholder="e.g., 10"
              />
           </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
           <h3 className="text-xl font-semibold mb-2 text-center text-emerald-400">Quiz Language</h3>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.values(QuizLanguage).map((lang) => (
                <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`p-3 rounded-lg text-center transition-all border-2 ${language === lang ? 'bg-brand-primary border-indigo-400 scale-105' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                >
                    <span className="font-semibold">{lang}</span>
                </button>
              ))}
            </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
           <h3 className="text-xl font-semibold mb-2 text-center text-emerald-400">Leaderboard Theme</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(themeOptions).map(([key, value]) => (
                <button 
                  key={key}
                  onClick={() => setTheme(key as LeaderboardTheme)}
                  className={`p-3 rounded-lg text-center transition-all border-2 ${theme === key ? 'bg-brand-primary border-indigo-400 scale-105' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
                >
                    <span className="text-2xl block mb-1">{value.icon}</span>
                    <span className="font-semibold">{value.name}</span>
                </button>
              ))}
            </div>
        </div>

      </div>
      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={goBack}>Back to Dashboard</Button>
        <Button onClick={handleCreateRoom}>Create Room</Button>
      </div>
    </Card>
  );
};

export default HostScreen;