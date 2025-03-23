import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { GameState } from '../types';
import StartScreen from './StartScreen';
import { useGameSound } from '../hooks/useGameSound';

// Расширяем типы для THREE.Mesh, чтобы включить BoxGeometry
interface PlatformMesh extends THREE.Mesh {
  geometry: THREE.BoxGeometry;
}

const Game: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const state = useRef<GameState>({
    lives: 3,
    score: 0,
    playerPosition: { x: 0, y: 1, z: 0 },
  });
  const levelRef = useRef<number>(1); // Текущий уровень (1 или 2)
  const { play, stop } = useGameSound(levelRef.current);

  useEffect(() => {
    if (!gameStarted) return;

    // Сохраняем ссылку на DOM элемент
    const mountElement = mountRef.current;

    // Сцена
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountElement?.appendChild(renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(ambientLight, directionalLight);

    // Игрок (Марио - красный куб)
    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 1, 0);
    scene.add(player);

    // Платформы и монеты
    const platforms: PlatformMesh[] = [];
    const coins: THREE.Mesh[] = [];
    const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const coinGeometry = new THREE.SphereGeometry(0.3, 32, 32);

    // Функция добавления платформы
    const addPlatform = (x: number, y: number, z: number, width: number, height: number, depth: number) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const platform = new THREE.Mesh(geometry, platformMaterial) as PlatformMesh;
      platform.position.set(x, y, z);
      scene.add(platform);
      platforms.push(platform);
    };

    // Функция добавления монеты
    const addCoin = (x: number, y: number, z: number) => {
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.position.set(x, y, z);
      scene.add(coin);
      coins.push(coin);
      gsap.to(coin.rotation, {
        y: Math.PI * 2,
        duration: 2,
        repeat: -1,
        ease: 'linear',
      });
    };

    // Функция загрузки уровня
    const loadLevel = (level: number) => {
      // Очистка текущих платформ и монет
      platforms.forEach((platform) => scene.remove(platform));
      coins.forEach((coin) => scene.remove(coin));
      platforms.length = 0;
      coins.length = 0;

      // Запускаем музыку для соответствующего уровня
      stop();
      play();

      if (level === 1) {
        // Уровень 1 (оригинальный)
        addPlatform(0, 0.5, 0, 10, 1, 10);   // База
        addPlatform(5, 2.5, -5, 5, 1, 5);    // Средняя платформа
        addPlatform(-5, 4.5, 5, 3, 1, 3);    // Верхняя платформа
        addPlatform(8, 3.5, 2, 4, 1, 4);     // Платформа справа
        addPlatform(-8, 1.5, -3, 6, 1, 3);   // Низкая слева
        addPlatform(2, 5.5, -2, 3, 1, 6);    // Высокая платформа

        addCoin(5, 3, -5);
        addCoin(-5, 5, 5);
        addCoin(8, 4, 2);
        addCoin(-8, 2, -3);
        addCoin(2, 6, -2);

        player.position.set(0, 1, 0); // Стартовая позиция для уровня 1
      } else if (level === 2) {
        // Уровень 2 (новый)
        addPlatform(0, 0.5, 0, 12, 1, 12);   // Большая база
        addPlatform(-6, 2.5, 6, 4, 1, 4);    // Платформа слева-сзади
        addPlatform(6, 4.5, -6, 5, 1, 5);    // Платформа справа-спереди
        addPlatform(0, 6.5, 0, 3, 1, 3);     // Центральная высокая платформа
        addPlatform(-8, 3.5, -4, 6, 1, 3);   // Платформа слева-спереди
        addPlatform(8, 5.5, 4, 4, 1, 4);     // Платформа справа-сзади

        addCoin(-6, 3, 6);    // На платформе слева-сзади
        addCoin(6, 5, -6);    // На платформе справа-спереди
        addCoin(0, 7, 0);     // На центральной платформе
        addCoin(-8, 4, -4);   // На платформе слева-спереди
        addCoin(8, 6, 4);     // На платформе справа-сзади

        player.position.set(0, 1, 0); // Стартовая позиция для уровня 2
      }
    };

    // Загрузка первого уровня
    loadLevel(1);

    // Физика
    let velocityY = 0;
    const gravity = -0.02;
    let isJumping = false;

    // Камера
    camera.position.set(0, 5, 10);
    camera.lookAt(player.position);

    // Управление
    const keys = { left: false, right: false, up: false, down: false, forward: false, backward: false, jump: false };
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') keys.left = true;
      if (e.key === 'ArrowRight') keys.right = true;
      if (e.key === 'ArrowUp') keys.up = true;
      if (e.key === 'ArrowDown') keys.down = true;
      if (e.key === 'w' || e.key === 'W') keys.forward = true;
      if (e.key === 's' || e.key === 'S') keys.backward = true;
      if (e.key === ' ' && !isJumping) {
        keys.jump = true;
        isJumping = true;
        velocityY = 0.5;
      }   
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') keys.left = false;
      if (e.key === 'ArrowRight') keys.right = false;
      if (e.key === 'ArrowUp') keys.up = false;
      if (e.key === 'ArrowDown') keys.down = false;
      if (e.key === 'w' || e.key === 'W') keys.forward = false;
      if (e.key === 's' || e.key === 'S') keys.backward = false;
      if (e.key === ' ') keys.jump = false;
    });

    // UI
    const ui = document.createElement('div');
    ui.style.position = 'absolute';
    ui.style.top = '10px';
    ui.style.left = '10px';
    ui.style.color = 'white';
    ui.style.fontFamily = 'Arial';
    ui.style.fontSize = '20px';
    document.body.appendChild(ui);

    // Функция поиска текущей платформы
    const getCurrentPlatform = (): PlatformMesh | null => {
      let currentPlatform: PlatformMesh | null = null;
      platforms.forEach((platform) => {
        const box = new THREE.Box3().setFromObject(platform);
        const playerBox = new THREE.Box3().setFromObject(player);
        if (playerBox.intersectsBox(box)) {
          currentPlatform = platform;
        }
      });
      return currentPlatform;
    };

    // Анимация
    const animate = () => {
      requestAnimationFrame(animate);

      // Движение по платформе (X, Y, Z)
      const currentPlatform = getCurrentPlatform();
      if (currentPlatform) {
        const platformBox = new THREE.Box3().setFromObject(currentPlatform);
        const minX = platformBox.min.x + 0.5;
        const maxX = platformBox.max.x - 0.5;
        const minY = platformBox.min.y + 0.5;
        const maxY = platformBox.max.y + 0.5;
        const minZ = platformBox.min.z + 0.5;
        const maxZ = platformBox.max.z - 0.5;

        if (keys.left) player.position.x -= 0.1;
        if (keys.right) player.position.x += 0.1;
        player.position.x = Math.max(minX, Math.min(maxX, player.position.x));

        if (!isJumping) {
          if (keys.up) player.position.y += 0.1;
          if (keys.down) player.position.y -= 0.1;
          player.position.y = Math.max(minY, Math.min(maxY, player.position.y));
        }

        if (keys.forward) player.position.z -= 0.1;
        if (keys.backward) player.position.z += 0.1;
        player.position.z = Math.max(minZ, Math.min(maxZ, player.position.z));
      } else {
        if (keys.left) player.position.x -= 0.1;
        if (keys.right) player.position.x += 0.1;
        if (keys.forward) player.position.z -= 0.1;
        if (keys.backward) player.position.z += 0.1;
      }

      // Гравитация и прыжки
      if (isJumping || !currentPlatform) {
        velocityY += gravity;
        player.position.y += velocityY;

        platforms.forEach((platform) => {
          const box = new THREE.Box3().setFromObject(platform);
          const playerBox = new THREE.Box3().setFromObject(player);
          if (playerBox.intersectsBox(box)) {
            if (velocityY <= 0) {
              player.position.y = box.max.y + 0.5;
              velocityY = 0;
              isJumping = false;
            } else if (velocityY > 0) {
              player.position.y = box.min.y - 0.5;
              velocityY = 0;
            }
          }
        });
      }

      // Падение и потеря жизни
      if (player.position.y < -5) {
        state.current.lives -= 1;
        player.position.set(0, 1, 0);
        velocityY = 0;
        isJumping = false;
        if (state.current.lives <= 0) {
          state.current.lives = 3;
          state.current.score = 0;
          levelRef.current = 1; // Возврат на первый уровень
          loadLevel(1);
        }
      }

      // Сбор монет
      coins.forEach((coin, index) => {
        const coinBox = new THREE.Box3().setFromObject(coin);
        const playerBox = new THREE.Box3().setFromObject(player);
        if (playerBox.intersectsBox(coinBox)) {
          state.current.score += 10;
          scene.remove(coin);
          coins.splice(index, 1);
        }
      });

      // Переход на новый уровень, если все монеты собраны
      if (coins.length === 0 && levelRef.current === 1) {
        levelRef.current = 2;
        loadLevel(2);
      }

      // Обновление UI
      if (coins.length === 0) {
        ui.textContent = `Вы Молодец! Lives: ${state.current.lives} | Score: ${state.current.score} | Level: ${levelRef.current}`;
      } else {
        ui.textContent = `Lives: ${state.current.lives} | Score: ${state.current.score} | Level: ${levelRef.current}`;
      }

      // Плавное слежение камеры
      gsap.to(camera.position, {
        x: player.position.x,
        y: player.position.y + 5,
        z: player.position.z + 10,
        duration: 0.5,
        ease: 'power2.out',
      });
      camera.lookAt(player.position);

      renderer.render(scene, camera);
    };
    animate();

    // Очистка
    return () => {
      if (mountElement) {
        mountElement.removeChild(renderer.domElement);
      }
      document.body.removeChild(ui);
      stop();
    };
  }, [gameStarted, play, stop]);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return <StartScreen onStart={handleStartGame} />;
  }

  return <div ref={mountRef} />;
};

export default Game;