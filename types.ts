export interface User {
  id: string;
  name: string;
  isHost: boolean;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  avatar: string;
  streak: number;
  bio?: string;
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum GameView {
  HOME = 'home',
  HOST_DASHBOARD = 'host_dashboard',
  HOST_CREATE = 'host_create',
  JOIN = 'join',
  LOBBY = 'lobby',
  QUIZ = 'quiz',
  LEADERBOARD = 'leaderboard',
}

export enum RoomStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished',
}

export enum LeaderboardTheme {
    DEFAULT = 'default',
    RACING = 'racing',
    SPACE_RACE = 'space_race',
    MOUNTAIN_CLIMB = 'mountain_climb',
}

export enum QuizLanguage {
    ENGLISH = 'English',
    SPANISH = 'Spanish',
    FRENCH = 'French',
    GERMAN = 'German',
    INDONESIAN = 'Indonesian',
}

export enum ConfidenceLevel {
    Cautious = 'cautious',
    Normal = 'normal',
    Confident = 'confident',
}

export interface Room {
  id: string;
  name: string;
  code: string;
  maxPlayers: number;
  players: Player[];
  status: RoomStatus;
  quiz: Question[];
  currentQuestionIndex: number;
  createdAt: number;
  theme: LeaderboardTheme;
  language: QuizLanguage;
  lastAnswerUpdate: {
    playerId: string;
    scoreGained: number;
    confidenceUsed: ConfidenceLevel;
    streakBonus: number;
  } | null;
  isDemo?: boolean;
}

export interface GameState {
  view: GameView;
  user: User;
  rooms: Room[];
  currentRoomCode: string | null;
  isDemoMode: boolean;
}
