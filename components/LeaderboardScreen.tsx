import React from 'react';
import type { Room, User } from '../types';
import { LeaderboardTheme } from '../types';
import DefaultLeaderboard from './leaderboards/DefaultLeaderboard';
import RacingLeaderboard from './leaderboards/RacingLeaderboard';
import SpaceRaceLeaderboard from './leaderboards/SpaceRaceLeaderboard';
import MountainClimbLeaderboard from './leaderboards/MountainClimbLeaderboard';

export interface ThemedLeaderboardProps {
  room: Room;
  user: User;
  nextQuestion: () => void;
  resetGame: () => void;
  exitDemo: () => void;
}

const LeaderboardScreen: React.FC<ThemedLeaderboardProps> = (props) => {
  const { room } = props;

  const renderLeaderboard = () => {
    switch (room.theme) {
      case LeaderboardTheme.RACING:
        return <RacingLeaderboard {...props} />;
      case LeaderboardTheme.SPACE_RACE:
        return <SpaceRaceLeaderboard {...props} />;
      case LeaderboardTheme.MOUNTAIN_CLIMB:
        return <MountainClimbLeaderboard {...props} />;
      case LeaderboardTheme.DEFAULT:
      default:
        return <DefaultLeaderboard {...props} />;
    }
  };

  return (
    <div className="animate-slide-in-up w-full">
      {renderLeaderboard()}
    </div>
  );
};

export default LeaderboardScreen;