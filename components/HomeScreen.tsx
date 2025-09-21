import React from 'react';
import Button from './common/Button';
import Card from './common/Card';

interface HomeScreenProps {
  hostGame: () => void;
  joinGame: () => void;
  startDemo: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ hostGame, joinGame, startDemo }) => {
  return (
    <Card className="text-center max-w-lg mx-auto animate-slide-in-up">
      <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
      <p className="text-gray-400 mb-8">Choose an option below to get started.</p>
      <div className="flex flex-col space-y-4">
        <Button onClick={hostGame} className="w-full text-lg py-4">
          Host Game
        </Button>
        <Button onClick={joinGame} variant="secondary" className="w-full text-lg py-4">
          Join Game
        </Button>
        <Button onClick={startDemo} variant="success" className="w-full text-lg py-4 bg-teal-600 hover:bg-teal-500 focus:ring-teal-400">
          Play Demo
        </Button>
      </div>
    </Card>
  );
};

export default HomeScreen;