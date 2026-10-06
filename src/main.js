import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#38bdf8',
  pixelArt: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1900 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [BootScene, MenuScene, GameScene]
};

new Phaser.Game(config);
