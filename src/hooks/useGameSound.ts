import { useEffect, useRef } from 'react';

export function useGameSound(level: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Функция для создания и настройки аудио элемента
  const setupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    audioRef.current = new Audio();
    const basePath = process.env.PUBLIC_URL || '';
    
    // Выбираем разную музыку для каждого уровня
    if (level === 1) {
      audioRef.current.src = `${basePath}/sounds/Ventum-Day of joy.mp3`;
    } else if (level === 2) {
      audioRef.current.src = `${basePath}/sounds/Ventum-Call of the Sands.mp3`;
    }

    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
  };

  useEffect(() => {
    setupAudio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [level]);

  return {
    play: () => {
      if (!audioRef.current?.src) {
        setupAudio();
      }
      audioRef.current?.play().catch((error) => {
        console.log('Ошибка воспроизведения музыки:', error);
      });
    },
    pause: () => {
      audioRef.current?.pause();
    },
    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };
} 