// Простой "звук" через Web Audio API — без файлов.
// Каждый вызов playHit создаёт короткий "бип" на заданной частоте.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    // AudioContext создаётся лениво — только когда реально нужен звук.
    // Браузеры требуют, чтобы это произошло после действия пользователя.
    ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return ctx;
}

export function playHit(frequency: number, duration = 0.06, volume = 0.15) {
  const audio = getCtx();
  if (!audio) return;

  // Если контекст "приостановлен" (например, вкладка была в фоне) — будим
  if (audio.state === 'suspended') {
    audio.resume();
  }

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'square';
  osc.frequency.value = frequency;

  // Плавное затухание, чтобы не было щелчка в конце
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audio.destination);

  osc.start();
  osc.stop(audio.currentTime + duration);
}

// Три разных звука — для разных событий
export const SOUND_PADDLE = 440; // удар о ракетку — средний тон
export const SOUND_WALL = 300;   // удар о стену — ниже
export const SOUND_SCORE = 660;  // гол — выше