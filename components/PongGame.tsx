'use client';

import { useEffect, useRef, useState } from 'react';
import {
  loadSettings,
  defaultSettings,
  addMatch,
  type Settings,
} from '@/lib/storage';
import { playHit, SOUND_PADDLE, SOUND_WALL, SOUND_SCORE } from '@/lib/sound';

const W = 600;
const H = 400;
const PADDLE_W = 10;
const PADDLE_H = 80;
const BALL_R = 8;
const WIN_SCORE = 5;

const BALL_SPEED: Record<Settings['speed'], number> = {
  slow: 4,
  normal: 6,
  fast: 8,
};

function aiSpeedFor(settings: Settings): number {
  const base =
    settings.speed === 'slow' ? 3 :
    settings.speed === 'normal' ? 4 :
    5;
  const k =
    settings.difficulty === 'easy' ? 0.6 :
    settings.difficulty === 'normal' ? 1 :
    1.4;
  return base * k;
}

type GameState = 'idle' | 'playing' | 'paused' | 'finished';

export default function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [state, setState] = useState<GameState>('idle');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  const playerY = useRef(H / 2 - PADDLE_H / 2);
  const aiY = useRef(H / 2 - PADDLE_H / 2);
  const ballX = useRef(W / 2);
  const ballY = useRef(H / 2);
  const ballVX = useRef(0);
  const ballVY = useRef(0);

  const frameCount = useRef(0);
  const aiError = useRef(0);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const resetBall = (direction: 1 | -1) => {
    ballX.current = W / 2;
    ballY.current = H / 2;
    const speed = BALL_SPEED[settings.speed];
    const angle = (Math.random() * Math.PI) / 3 - Math.PI / 6;
    ballVX.current = Math.cos(angle) * speed * direction;
    ballVY.current = Math.sin(angle) * speed;
  };

  const startGame = () => {
    playerY.current = H / 2 - PADDLE_H / 2;
    aiY.current = H / 2 - PADDLE_H / 2;
    setPlayerScore(0);
    setAiScore(0);
    setWinner(null);
    setState('playing');
    resetBall(Math.random() > 0.5 ? 1 : -1);
  };

  const endGame = (who: 'player' | 'ai', pScore: number, aScore: number) => {
    setWinner(who);
    setState('finished');
    addMatch({
      date: new Date().toISOString(),
      playerScore: pScore,
      aiScore: aScore,
      won: who === 'player',
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      playerY.current = Math.max(
        0,
        Math.min(H - PADDLE_H, y - PADDLE_H / 2)
      );
    };

    const handleKey = (e: KeyboardEvent) => {
      const step = 30;
      if (e.key === 'ArrowUp') {
        playerY.current = Math.max(0, playerY.current - step);
      } else if (e.key === 'ArrowDown') {
        playerY.current = Math.min(H - PADDLE_H, playerY.current + step);
      } else if (e.code === 'Space') {
        setState((s) => {
          if (s === 'playing') return 'paused';
          if (s === 'paused') return 'playing';
          return s;
        });
        e.preventDefault();
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKey);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  useEffect(() => {
    if (state !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const loop = () => {
      frameCount.current++;

      ballX.current += ballVX.current;
      ballY.current += ballVY.current;

      // Отскок от стен (со звуком)
      if (ballY.current - BALL_R < 0) {
        ballY.current = BALL_R;
        ballVY.current *= -1;
        playHit(SOUND_WALL);
      }
      if (ballY.current + BALL_R > H) {
        ballY.current = H - BALL_R;
        ballVY.current *= -1;
        playHit(SOUND_WALL);
      }

      // ИИ
      const aiSpeed = aiSpeedFor(settings);
      const aiTarget = ballY.current - PADDLE_H / 2;

      const errorAmp =
        settings.difficulty === 'easy' ? 40 :
        settings.difficulty === 'normal' ? 12 : 0;
      if (frameCount.current % 60 === 0) {
        aiError.current = (Math.random() * 2 - 1) * errorAmp;
      }

      const target = aiTarget + aiError.current;
      if (Math.abs(target - aiY.current) > aiSpeed) {
        aiY.current += Math.sign(target - aiY.current) * aiSpeed;
      } else {
        aiY.current = target;
      }
      aiY.current = Math.max(0, Math.min(H - PADDLE_H, aiY.current));

      // Игрок
      if (
        ballVX.current < 0 &&
        ballX.current - BALL_R < PADDLE_W &&
        ballY.current > playerY.current &&
        ballY.current < playerY.current + PADDLE_H
      ) {
        ballX.current = PADDLE_W + BALL_R;
        ballVX.current *= -1.05;
        const hitPos =
          (ballY.current - (playerY.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        ballVY.current += hitPos * 2;
        playHit(SOUND_PADDLE);
      }

      // ИИ-ракетка
      if (
        ballVX.current > 0 &&
        ballX.current + BALL_R > W - PADDLE_W &&
        ballY.current > aiY.current &&
        ballY.current < aiY.current + PADDLE_H
      ) {
        ballX.current = W - PADDLE_W - BALL_R;
        ballVX.current *= -1.05;
        const hitPos =
          (ballY.current - (aiY.current + PADDLE_H / 2)) / (PADDLE_H / 2);
        ballVY.current += hitPos * 2;
        playHit(SOUND_PADDLE);
      }

      // Гол игроку
      if (ballX.current - BALL_R > W) {
        playHit(SOUND_SCORE);
        setPlayerScore((s) => {
          const ns = s + 1;
          if (ns >= WIN_SCORE) endGame('player', ns, aiScore);
          return ns;
        });
        resetBall(-1);
      }

      // Гол ИИ
      if (ballX.current + BALL_R < 0) {
        playHit(SOUND_SCORE);
        setAiScore((s) => {
          const ns = s + 1;
          if (ns >= WIN_SCORE) endGame('ai', playerScore, ns);
          return ns;
        });
        resetBall(1);
      }

      // --- Отрисовка ---
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = settings.paddleColor;
      ctx.fillRect(0, playerY.current, PADDLE_W, PADDLE_H);
      ctx.fillRect(W - PADDLE_W, aiY.current, PADDLE_W, PADDLE_H);

      ctx.fillStyle = settings.ballColor;
      ctx.beginPath();
      ctx.arc(ballX.current, ballY.current, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, settings]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-[600px] flex justify-between items-center px-2">
        <div className="text-sm text-gray-500">Ты</div>
        <div className="text-2xl font-bold tabular-nums">
          {playerScore} : {aiScore}
        </div>
        <div className="text-sm text-gray-500">ИИ</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="bg-white border border-gray-200 rounded-lg max-w-full h-auto touch-none select-none"
        />

        {state === 'idle' && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 rounded-lg">
            <p className="text-gray-700 text-center px-6">
              Управляй ракеткой мышью или стрелками ↑ ↓. Пробел — пауза. Играем до {WIN_SCORE} очков.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800"
            >
              Начать игру
            </button>
          </div>
        )}

        {state === 'paused' && (
          <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2 rounded-lg">
            <h2 className="text-2xl font-bold">⏸ Пауза</h2>
            <p className="text-gray-600 text-sm">Нажми пробел, чтобы продолжить</p>
          </div>
        )}

        {state === 'finished' && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center gap-3 rounded-lg">
            <h2 className="text-2xl font-bold">
              {winner === 'player' ? '🎉 Ты победил!' : '😔 ИИ победил'}
            </h2>
            <p className="text-gray-600">
              Счёт: {playerScore} : {aiScore}
            </p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={startGame}
                className="px-6 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800"
              >
                Играть ещё
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}