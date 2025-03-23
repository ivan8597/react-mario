import { useEffect, useRef } from 'react';

export function useGameSound(level: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Создаем новый аудио элемент
    audioRef.current = new Audio();
    
    // Добавляем базовый путь для GitHub Pages
    const basePath = process.env.PUBLIC_URL || '';
    
    // Выбираем музыку в зависимости от уровня
    if (level === 1) {
      audioRef.current.src = `${basePath}/sounds/level1.mp3`;
    } else if (level === 2) {
      audioRef.current.src = `${basePath}/sounds/level2.mp3`;
    }

    if (audioRef.current) {
      audioRef.current.loop = true; // Зацикливаем музыку
      audioRef.current.volume = 0.5; // Устанавливаем громкость на 50%
      
      // Воспроизводим музыку только после взаимодействия пользователя
      const playMusic = () => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            console.log('Ошибка воспроизведения музыки');
          });
        }
        document.removeEventListener('click', playMusic);
      };
      
      document.addEventListener('click', playMusic);
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
    play: () => {
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          console.log('Требуется взаимодействие пользователя для воспроизведения музыки');
        });
      }
    },
    pause: () => audioRef.current?.pause(),
    stop: () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };
} 