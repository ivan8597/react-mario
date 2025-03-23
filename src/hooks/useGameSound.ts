import { useEffect, useRef } from 'react';

export function useGameSound(level: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Создаем новый аудио элемент
    audioRef.current = new Audio();
    
    // Выбираем музыку в зависимости от уровня
    if (level === 1) {
      audioRef.current.src = '/sounds/Ventum-Day of joy.mp3';
    } else if (level === 2) {
      audioRef.current.src = '/sounds/Ventum-Call of the Sands.mp3';
    }

    if (audioRef.current) {
      audioRef.current.loop = true; // Зацикливаем музыку
      audioRef.current.volume = 0.5; // Устанавливаем громкость на 50%
      audioRef.current.play().catch(() => {
        console.log('Автовоспроизведение заблокировано браузером. Нужно взаимодействие пользователя.');
      });
    }

    // Очистка при размонтировании
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [level]);

  return {
    play: () => audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };
} 