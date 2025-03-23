export interface GameState {
  lives: number;
  score: number;
  playerPosition: { x: number; y: number; z: number };
}