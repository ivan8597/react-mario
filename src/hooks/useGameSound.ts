import { useEffect, useRef, useCallback } from 'react';

export function useGameSound(level: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Используем useCallback для мемоизации функции setupAudio
  const setupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    audioRef.current = new Audio();
    
    // Используем относительные пути без пробелов
    if (level === 1) {
      audioRef.current.src = './sounds/level1.mp3';
      console.log('Loading level 1 music:', audioRef.current.src);
    } else if (level === 2) {
      audioRef.current.src = './sounds/level2.mp3';
      console.log('Loading level 2 music:', audioRef.current.src);
    }

    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
      
      // Добавляем обработчики событий для отладки
      audioRef.current.addEventListener('canplay', () => {
        console.log('Audio can play now');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }
  }, [level]); // Зависимость от level

  useEffect(() => {
    setupAudio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [setupAudio]); 

  return {
    play: () => {
      if (!audioRef.current?.src) {
        setupAudio();
      }
      audioRef.current?.play().catch((error) => {
        console.error('Ошибка воспроизведения музыки:', error);
        // Попробуем загрузить файл еще раз с другим путем
        if (audioRef.current) {
          const currentSrc = audioRef.current.src;
          if (currentSrc.includes('./sounds/')) {
            audioRef.current.src = currentSrc.replace('./sounds/', '/sounds/');
            console.log('Trying alternative path:', audioRef.current.src);
            audioRef.current.play().catch(e => console.error('Still failed:', e));
          }
        }
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