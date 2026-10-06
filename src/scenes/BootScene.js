import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    const g = this.add.graphics();

    // OG Potato is intentionally preserved as the fallback/secret character.
    // Polished character assets can replace the active runner keys later without
    // deleting the original prototype mascot.
    this.makeRunner(g, 'og-potato-run-a', 0);
    this.makeRunner(g, 'og-potato-run-b', 5);
    this.makeRunner(g, 'og-potato-jump', -7);
    this.makeDuckRunner(g, 'og-potato-duck');

    this.makeRunner(g, 'runner-run-a', 0);
    this.makeRunner(g, 'runner-run-b', 5);
    this.makeRunner(g, 'runner-jump', -7);
    this.makeDuckRunner(g, 'runner-duck');

    g.fillStyle(0xff7a00).fillRoundedRect(8, 8, 34, 66, 9);
    g.fillStyle(0xfacc15).fillRect(15, 1, 20, 12);
    g.fillStyle(0xffffff).fillRoundedRect(13, 30, 24, 19, 6);
    g.fillStyle(0x6d28d9).fillRect(17, 35, 16, 4);
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

    g.fillStyle(0x22c55e).fillCircle(32, 32, 29);
    g.lineStyle(6, 0xffffff).strokeCircle(32, 32, 22);
    g.fillStyle(0xffffff).fillTriangle(32, 10, 18, 35, 32, 54);
    g.fillTriangle(32, 10, 46, 35, 32, 54);
    g.generateTexture('power-shield', 64, 64);
    g.clear();

    g.fillStyle(0xec4899).fillRoundedRect(8, 8, 48, 48, 12);
    g.fillStyle(0xffffff).fillRect(14, 16, 12, 30);
    g.fillRect(38, 16, 12, 30);
    g.fillStyle(0x60a5fa).fillRect(14, 40, 12, 10);
    g.fillRect(38, 40, 12, 10);
    g.generateTexture('power-magnet', 64, 64);
    g.clear();

    g.fillStyle(0xfacc15).fillCircle(32, 32, 29);
    g.fillStyle(0x6d28d9);
    g.fillTriangle(35, 5, 17, 34, 30, 34);
    g.fillTriangle(29, 59, 47, 30, 34, 30);
    g.generateTexture('power-double', 64, 64);
    g.clear();

    g.fillStyle(0x6d28d9).fillRoundedRect(0, 0, 150, 42, 8);
    g.fillStyle(0xfacc15).fillRect(12, 9, 126, 24);
    g.fillStyle(0x111827).fillRect(20, 16, 110, 10);
    g.generateTexture('awning', 150, 42);
    g.clear();

    g.fillStyle(0xef4444).fillRoundedRect(0, 0, 120, 36, 8);
    g.fillStyle(0xffffff).fillRect(12, 12, 96, 8);
    g.generateTexture('barrier', 120, 36);
    g.destroy();

    this.scene.start('MenuScene');
  }

  makeDuckRunner(g, key) {
    g.clear();

    // Low, horizontal silhouette so ducking is unmistakable even with placeholder art.
    g.fillStyle(0x4c1d95);
    for (let i = 0; i < 8; i++) {
      const x = 18 + i * 8;
      const tipY = 20 + (i % 2) * 5;
      g.fillTriangle(x, 48, x + 5, tipY, x + 11, 48);
    }

    g.fillStyle(0x7c3aed).fillEllipse(47, 58, 72, 48);
    g.fillStyle(0x7c3aed).fillCircle(70, 52, 23);
    g.fillStyle(0xfacc15).fillRoundedRect(23, 70, 58, 19, 7);

    g.fillStyle(0xffffff).fillCircle(75, 45, 8);
    g.fillStyle(0x111827).fillCircle(78, 46, 3);
    g.fillStyle(0xec4899).fillCircle(25, 59, 6);

    // Tucked legs/feet.
    g.fillStyle(0x111827).fillRoundedRect(29, 88, 20, 7, 3);
    g.fillRoundedRect(57, 88, 20, 7, 3);

    g.generateTexture(key, 100, 100);
  }

  makeRunner(g, key, legOffset) {
    g.clear();
    g.fillStyle(0x4c1d95);
    for (let i = 0; i < 9; i++) {
      const angle = Phaser.Math.DegToRad(150 + i * 17);
      g.fillTriangle(45, 42, 45 + Math.cos(angle) * 52, 42 + Math.sin(angle) * 52,
        45 + Math.cos(angle + .15) * 43, 42 + Math.sin(angle + .15) * 43);
    }
    g.fillStyle(0x7c3aed).fillCircle(45, 43, 35);
    g.fillStyle(0xfacc15).fillRoundedRect(23, 66, 44, 25, 7);
    g.fillStyle(0xffffff).fillCircle(58, 34, 10);
    g.fillStyle(0x111827).fillCircle(61, 35, 4);
    g.fillStyle(0xec4899).fillCircle(24, 47, 7);
    g.fillStyle(0x111827).fillRect(31, 91, 9, 10 + Math.max(0, legOffset));
    g.fillRect(55, 91, 9, 10 + Math.max(0, -legOffset));
    g.generateTexture(key, 90, 112);
  }
}
