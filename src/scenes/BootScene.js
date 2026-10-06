import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    const g = this.add.graphics();

    g.fillStyle(0x6d28d9).fillCircle(45, 45, 38);
    g.fillStyle(0xfacc15).fillRect(23, 68, 44, 28);
    g.fillStyle(0xffffff).fillCircle(58, 35, 10);
    g.fillStyle(0x111827).fillCircle(61, 36, 4);
    g.fillStyle(0xec4899).fillCircle(25, 48, 7);
    g.generateTexture('runner', 90, 104);
    g.clear();

    g.fillStyle(0xff7a00).fillRoundedRect(8, 8, 34, 66, 9);
    g.fillStyle(0xffffff).fillRoundedRect(13, 30, 24, 17, 6);
    g.generateTexture('bottle', 50, 82);
    g.clear();

    g.fillStyle(0xfbbf24).fillRoundedRect(0, 0, 80, 75, 8);
    g.fillStyle(0x111827).fillTriangle(40, 12, 15, 58, 65, 58);
    g.generateTexture('crate', 80, 75);
    g.clear();

    g.fillStyle(0x60a5fa).fillEllipse(55, 25, 110, 50);
    g.fillStyle(0xffffff, .7).fillEllipse(42, 18, 45, 12);
    g.generateTexture('puddle', 110, 50);
    g.clear();

    g.fillStyle(0xef4444).fillRoundedRect(0, 0, 120, 36, 8);
    g.fillStyle(0xffffff).fillRect(12, 12, 96, 8);
    g.generateTexture('barrier', 120, 36);
    g.destroy();

    this.scene.start('MenuScene');
  }
}
