import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStart: () => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="start-screen">
      <h1 className="title">Super Mario React</h1>
      <button className="start-button" onClick={onStart}>Start Game</button>
      <div className="instructions">
        <p>Управление:</p>
        <p>← → - движение влево/вправо</p>
        <p>W S - движение вперед/назад</p>
        <p>Пробел - прыжок</p>
        <p>Собирайте монеты и переходите на следующий уровень!</p>
      </div>
    </div>
  );
}

export default StartScreen; 