
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameView, User, Room, RoomStatus, Question, Player, LeaderboardTheme, QuizLanguage, ConfidenceLevel } from './types';
import { generateQuiz } from './services/geminiService';
import HomeScreen from './components/HomeScreen';
import HostScreen from './components/HostScreen';
import JoinScreen from './components/JoinScreen';
import LobbyScreen from './components/LobbyScreen';
import QuizScreen from './components/QuizScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import Header from './components/Header';
import HostDashboard from './components/HostDashboard';
import Button from './components/common/Button';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedState = localStorage.getItem('geminiQuizGameState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            // Reset view to home on reload but keep data
            return { ...parsedState, view: GameView.HOME, currentRoomCode: null, isDemoMode: false };
        }
        return {
            view: GameView.HOME,
            user: { id: '', name: '', isHost: false },
            rooms: [],
            currentRoomCode: null,
            isDemoMode: false,
        };
    });

    // FIX: Define updateGameState to provide a consistent way to update parts of the game state.
    const updateGameState = useCallback((newState: Partial<GameState>) => {
        setGameState(prevState => ({ ...prevState, ...newState }));
    }, []);

    useEffect(() => {
        const stateToSave = { ...gameState, view: GameView.HOME, currentRoomCode: null, isDemoMode: false };
        localStorage.setItem('geminiQuizGameState', JSON.stringify(stateToSave));
    }, [gameState]);

    // Room expiration cleanup
    useEffect(() => {
        const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000;
        const interval = setInterval(() => {
            const now = Date.now();
            const activeRooms = gameState.rooms.filter(room => (now - room.createdAt) < FOUR_HOURS_IN_MS);
            if (activeRooms.length !== gameState.rooms.length) {
                updateGameState({ rooms: activeRooms });
            }
        }, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [gameState.rooms, updateGameState]);

    const goHome = useCallback(() => {
        updateGameState({ view: GameView.HOME, currentRoomCode: null, user: { ...gameState.user, isHost: false } });
    }, [gameState.user, updateGameState]);
    
    const exitHostMode = () => {
        updateGameState({
            user: { ...gameState.user, isHost: false },
            view: GameView.HOME,
            currentRoomCode: null
        });
    }

    const generateRoomCode = (): string => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const createHostSession = () => {
        const userId = gameState.user.id || `user_${Date.now()}`;
        updateGameState({
            user: { id: userId, name: 'Host', isHost: true },
            view: GameView.HOST_DASHBOARD,
        });
    };

    const createNewRoom = () => updateGameState({ view: GameView.HOST_CREATE });

    const createRoom = (roomName: string, maxPlayers: number, quiz: Question[], theme: LeaderboardTheme, language: QuizLanguage) => {
        const newRoom: Room = {
            id: `room_${Date.now()}`,
            name: roomName,
            code: generateRoomCode(),
            maxPlayers,
            players: [],
            status: RoomStatus.WAITING,
            quiz,
            currentQuestionIndex: 0,
            createdAt: Date.now(),
            theme,
            language,
            lastAnswerUpdate: null,
        };
        updateGameState({
            rooms: [...gameState.rooms, newRoom],
            currentRoomCode: newRoom.code,
            view: GameView.LOBBY,
        });
    };

    const deleteRoom = (roomId: string) => {
        updateGameState({
            rooms: gameState.rooms.filter(r => r.id !== roomId),
        });
    };

    const viewLobby = (roomCode: string) => {
        updateGameState({ currentRoomCode: roomCode, view: GameView.LOBBY });
    };

    const joinRoom = (roomCode: string, playerName: string, playerBio?: string) => {
        const roomIndex = gameState.rooms.findIndex(r => r.code === roomCode);
        if (roomIndex === -1) {
            alert('Room not found!');
            return;
        }

        const room = gameState.rooms[roomIndex];
        if (room.players.length >= room.maxPlayers) {
            alert('Room is full!');
            return;
        }

        const userId = `user_${Date.now()}`;
        const newPlayer: Player = {
            id: userId,
            name: playerName,
            score: 0,
            avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${playerName}`,
            streak: 0,
            bio: playerBio
        };

        const updatedRoom = { ...room, players: [...room.players, newPlayer] };
        const updatedRooms = [...gameState.rooms];
        updatedRooms[roomIndex] = updatedRoom;

        updateGameState({
            rooms: updatedRooms,
            user: { id: userId, name: playerName, isHost: false },
            currentRoomCode: roomCode,
            view: GameView.LOBBY
        });
    };
    
    const leaveRoom = () => {
        if (!gameState.currentRoomCode) return;

        const roomIndex = gameState.rooms.findIndex(r => r.code === gameState.currentRoomCode);
        if (roomIndex === -1) {
            goHome();
            return;
        }

        const room = gameState.rooms[roomIndex];
        const updatedPlayers = room.players.filter(p => p.id !== gameState.user.id);
        const updatedRoom = { ...room, players: updatedPlayers };
        const updatedRooms = [...gameState.rooms];
        updatedRooms[roomIndex] = updatedRoom;

        updateGameState({ rooms: updatedRooms, view: GameView.HOME, currentRoomCode: null });
    };

    const startGame = () => {
        if (!gameState.currentRoomCode) return;
        const roomIndex = gameState.rooms.findIndex(r => r.code === gameState.currentRoomCode);
        if (roomIndex === -1) return;

        const updatedRoom = { ...gameState.rooms[roomIndex], status: RoomStatus.IN_PROGRESS };
        const updatedRooms = [...gameState.rooms];
        updatedRooms[roomIndex] = updatedRoom;

        updateGameState({ rooms: updatedRooms, view: GameView.QUIZ });
    };

     const calculateScore = (correct: boolean, confidence: ConfidenceLevel, streak: number) => {
        let scoreGained = 0;
        let streakBonus = 0;
        let newStreak = streak;

        if (correct) {
            newStreak++;
            streakBonus = newStreak >= 3 ? (newStreak - 2) * 100 : 0;
            let baseScore = 1000 + streakBonus;

            if (confidence === ConfidenceLevel.Confident) scoreGained = baseScore * 2;
            else if (confidence === ConfidenceLevel.Cautious) scoreGained = baseScore * 0.5;
            else scoreGained = baseScore;
        } else {
            newStreak = 0;
            if (confidence === ConfidenceLevel.Confident) scoreGained = -500;
        }
        return { scoreGained, newStreak, streakBonus };
    };

    const submitAnswer = (playerId: string, selectedOption: string, confidence: ConfidenceLevel) => {
        if (!gameState.currentRoomCode) return;

        const roomIndex = gameState.rooms.findIndex(r => r.code === gameState.currentRoomCode);
        if (roomIndex === -1) return;
        
        const room = gameState.rooms[roomIndex];
        const question = room.quiz[room.currentQuestionIndex];
        
        let updatedPlayers = [...room.players];
        let latestAnswerUpdate: Room['lastAnswerUpdate'] = null;

        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const player = room.players[playerIndex];
            const isCorrect = selectedOption === question.correctAnswer;
            const { scoreGained, newStreak, streakBonus } = calculateScore(isCorrect, confidence, player.streak);

            const updatedPlayer = { ...player, score: Math.max(0, player.score + scoreGained), streak: newStreak };
            updatedPlayers[playerIndex] = updatedPlayer;
            latestAnswerUpdate = { playerId, scoreGained, confidenceUsed: confidence, streakBonus };
        }
        
        // If this is a demo, process AI answers now
        if (room.isDemo && playerId === gameState.user.id) {
            const aiAnswers = [
                { id: 'ai_gizmo', confidence: ConfidenceLevel.Confident, correctChance: 0.6 }, // Gambler
                { id: 'ai_sparky', confidence: ConfidenceLevel.Normal, correctChance: 0.85 }, // Strategist
                { id: 'ai_bolt', confidence: ConfidenceLevel.Cautious, correctChance: 0.75 }, // Cautious
            ];

            aiAnswers.forEach(ai => {
                const aiPlayerIndex = updatedPlayers.findIndex(p => p.id === ai.id);
                if (aiPlayerIndex !== -1) {
                    const aiPlayer = updatedPlayers[aiPlayerIndex];
                    const isCorrect = Math.random() < ai.correctChance;
                    const { scoreGained, newStreak } = calculateScore(isCorrect, ai.confidence, aiPlayer.streak);
                    updatedPlayers[aiPlayerIndex] = { ...aiPlayer, score: Math.max(0, aiPlayer.score + scoreGained), streak: newStreak };
                }
            });
        }
        
        const updatedRoom = { ...room, players: updatedPlayers, lastAnswerUpdate: latestAnswerUpdate };
        const updatedRooms = [...gameState.rooms];
        updatedRooms[roomIndex] = updatedRoom;

        setGameState(prevState => ({ ...prevState, rooms: updatedRooms }));
    };

    const showLeaderboard = useCallback(() => {
        updateGameState({ view: GameView.LEADERBOARD });
    }, [updateGameState]);

    const nextQuestion = () => {
        if (!gameState.currentRoomCode) return;

        const roomIndex = gameState.rooms.findIndex(r => r.code === gameState.currentRoomCode);
        if (roomIndex === -1) return;

        const room = gameState.rooms[roomIndex];
        if (room.currentQuestionIndex + 1 < room.quiz.length) {
            const updatedRoom = { ...room, currentQuestionIndex: room.currentQuestionIndex + 1, lastAnswerUpdate: null };
            const updatedRooms = [...gameState.rooms];
            updatedRooms[roomIndex] = updatedRoom;
            updateGameState({ rooms: updatedRooms, view: GameView.QUIZ });
        } else {
            const updatedRoom = { ...room, status: RoomStatus.FINISHED, lastAnswerUpdate: null };
            const updatedRooms = [...gameState.rooms];
            updatedRooms[roomIndex] = updatedRoom;
            updateGameState({ rooms: updatedRooms, view: GameView.LEADERBOARD });
        }
    };
    
    const resetGame = () => {
         if (!gameState.currentRoomCode) return;
        const roomIndex = gameState.rooms.findIndex(r => r.code === gameState.currentRoomCode);
        if (roomIndex === -1) return;
        
        const room = gameState.rooms[roomIndex];
        const resetPlayers = room.players.map(p => ({ ...p, score: 0, streak: 0 }));
        const updatedRoom = {
            ...room,
            status: RoomStatus.WAITING,
            currentQuestionIndex: 0,
            players: resetPlayers,
            lastAnswerUpdate: null,
        };
        const updatedRooms = [...gameState.rooms];
        updatedRooms[roomIndex] = updatedRoom;
        updateGameState({ rooms: updatedRooms, view: GameView.LOBBY });
    }
    
    const spectateRoom = (roomCode: string) => {
        updateGameState({ currentRoomCode: roomCode, view: GameView.LEADERBOARD });
    }

    const startDemo = () => {
        const demoUserId = 'user_demo';
        const demoRoomCode = 'DEMO1';

        const humanPlayer: Player = {
            id: demoUserId, name: 'You', score: 0, avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=You`, streak: 0, bio: "Learning the ropes!"
        };
        const aiPlayers: Player[] = [
            { id: 'ai_gizmo', name: 'Gizmo', score: 0, avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Gizmo`, streak: 0, bio: "High risk, high reward!" },
            { id: 'ai_sparky', name: 'Sparky', score: 0, avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Sparky`, streak: 0, bio: "Slow and steady." },
            { id: 'ai_bolt', name: 'Bolt', score: 0, avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=Bolt`, streak: 0, bio: "Better safe than sorry." },
        ];

        const demoQuiz: Question[] = [{
            question: "Which planet is known as the Red Planet?",
            options: ["Earth", "Mars", "Jupiter", "Venus"],
            correctAnswer: "Mars",
        }];

        const demoRoom: Room = {
            id: `room_demo_${Date.now()}`,
            name: "Interactive Demo",
            code: demoRoomCode,
            maxPlayers: 4,
            players: [humanPlayer, ...aiPlayers],
            status: RoomStatus.WAITING,
            quiz: demoQuiz,
            currentQuestionIndex: 0,
            createdAt: Date.now(),
            theme: LeaderboardTheme.RACING,
            language: QuizLanguage.ENGLISH,
            lastAnswerUpdate: null,
            isDemo: true,
        };
    
        updateGameState({ 
            rooms: [...gameState.rooms.filter(r => !r.isDemo), demoRoom], 
            currentRoomCode: demoRoomCode, 
            view: GameView.LOBBY,
            isDemoMode: true,
            user: { id: demoUserId, name: 'You', isHost: true } // Host to control demo flow
        });

        // Auto-start the game after a brief moment in the lobby
        setTimeout(() => {
            setGameState(prevState => {
                const roomIdx = prevState.rooms.findIndex(r => r.code === demoRoomCode);
                if (roomIdx === -1) return prevState;
                const updatedRoom = { ...prevState.rooms[roomIdx], status: RoomStatus.IN_PROGRESS };
                const updatedRooms = [...prevState.rooms];
                updatedRooms[roomIdx] = updatedRoom;
                return { ...prevState, rooms: updatedRooms, view: GameView.QUIZ };
            });
        }, 3000);
    };
    
    const exitDemo = useCallback(() => {
        updateGameState({ 
            isDemoMode: false, 
            rooms: gameState.rooms.filter(r => !r.isDemo),
            currentRoomCode: null,
            view: GameView.HOME,
            user: { ...gameState.user, isHost: false }
        });
    }, [gameState.rooms, gameState.user, updateGameState]);


    const renderView = () => {
        const currentRoom = gameState.rooms.find(r => r.code === gameState.currentRoomCode);

        switch (gameState.view) {
            case GameView.HOST_DASHBOARD:
                return <HostDashboard rooms={gameState.rooms.filter(r => !r.isDemo)} createNewRoom={createNewRoom} viewLobby={viewLobby} deleteRoom={deleteRoom} spectateRoom={spectateRoom} goBack={exitHostMode} />;
            case GameView.HOST_CREATE:
                return <HostScreen createRoom={createRoom} goBack={() => updateGameState({ view: GameView.HOST_DASHBOARD })} />;
            case GameView.JOIN:
                const urlParams = new URLSearchParams(window.location.search);
                const roomCodeFromUrl = urlParams.get('room');
                return <JoinScreen joinRoom={joinRoom} goBack={goHome} initialRoomCode={roomCodeFromUrl || ''} />;
            case GameView.LOBBY:
                if (!currentRoom) { goHome(); return null; }
                return <LobbyScreen room={currentRoom} user={gameState.user} startGame={startGame} goBack={gameState.user.isHost ? () => updateGameState({ view: GameView.HOST_DASHBOARD }) : leaveRoom} />;
            case GameView.QUIZ:
                if (!currentRoom) { goHome(); return null; }
                return <QuizScreen room={currentRoom} user={gameState.user} submitAnswer={submitAnswer} showLeaderboard={showLeaderboard} />;
            case GameView.LEADERBOARD:
                if (!currentRoom) { goHome(); return null; }
                return <LeaderboardScreen room={currentRoom} user={gameState.user} nextQuestion={nextQuestion} resetGame={resetGame} exitDemo={exitDemo} />;
            case GameView.HOME:
            default:
                return <HomeScreen hostGame={createHostSession} joinGame={() => updateGameState({ view: GameView.JOIN })} startDemo={startDemo} />;
        }
    };

    return (
        <div className="bg-grid-pattern bg-grid-pattern min-h-screen text-white flex flex-col items-center justify-center p-4 font-sans relative">
            <div className="w-full max-w-5xl mx-auto space-y-8">
                 <Header onLogoClick={gameState.isDemoMode ? exitDemo : goHome} />
                 {gameState.isDemoMode && (
                    <div className="fixed top-4 right-4 z-50">
                        <Button onClick={exitDemo} variant="danger">Exit Demo</Button>
                    </div>
                )}
                 {renderView()}
            </div>
        </div>
    );
};

export default App;
