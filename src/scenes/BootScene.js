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

    this.makeZoomRunner(g, 'runner-run-a', 'run-a');
    this.makeZoomRunner(g, 'runner-run-b', 'run-b');
    this.makeZoomRunner(g, 'runner-jump', 'jump');
    this.makeZoomRunner(g, 'runner-duck', 'duck');

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

  makeZoomRunner(g, key, pose) {
    g.clear();

    const duck = pose === 'duck';
    const jump = pose === 'jump';
    const runB = pose === 'run-b';

    // Back quills: softer, fuller silhouette than OG Potato while keeping
    // the purple Zoomarati identity.
    g.fillStyle(0x4c1d95);
    if (duck) {
      for (let i = 0; i < 8; i++) {
        const x = 12 + i * 10;
        g.fillTriangle(x, 55, x + 5, 20 + (i % 2) * 5, x + 13, 56);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        const angle = Phaser.Math.DegToRad(145 + i * 18);
        g.fillTriangle(
          47, 46,
          47 + Math.cos(angle) * 48, 46 + Math.sin(angle) * 48,
          47 + Math.cos(angle + .17) * 39, 46 + Math.sin(angle + .17) * 39
        );
      }
    }

    // Body/head.
    g.fillStyle(0x7c3aed);
    if (duck) {
      g.fillEllipse(52, 61, 78, 48);
      g.fillCircle(76, 54, 24);
    } else {
      g.fillEllipse(48, 49, 68, 72);
      g.fillCircle(69, 42, 27);
    }

    // Face muzzle, cheek, eye and expressive brow.
    const eyeY = duck ? 47 : 34;
    g.fillStyle(0xf4c7a1).fillEllipse(82, duck ? 58 : 49, 27, 20);
    g.fillStyle(0xec4899).fillCircle(35, duck ? 62 : 53, 7);
    g.fillStyle(0xffffff).fillEllipse(72, eyeY, 15, 18);
    g.fillStyle(0x111827).fillCircle(75, eyeY + 1, 5);
    g.lineStyle(3, 0x111827).lineBetween(65, eyeY - 12, 78, eyeY - 15);
    g.fillStyle(0x111827).fillCircle(94, duck ? 56 : 47, 5);

    // Zoom yellow top with purple Z badge.
    const shirtY = duck ? 70 : 69;
    g.fillStyle(0xfacc15).fillRoundedRect(duck ? 30 : 25, shirtY, duck ? 60 : 49, duck ? 19 : 25, 7);
    g.fillStyle(0x6d28d9);
    if (duck) {
      g.fillTriangle(55, 74, 69, 74, 55, 85);
      g.fillTriangle(55, 85, 69, 85, 69, 74);
    } else {
      g.fillTriangle(43, 74, 57, 74, 43, 88);
      g.fillTriangle(43, 88, 57, 88, 57, 74);
    }

    // Arms and legs give each state a distinct readable pose.
    g.lineStyle(7, 0x7c3aed);
    if (duck) {
      g.lineBetween(37, 73, 21, 82);
      g.lineBetween(75, 72, 91, 78);
      g.fillStyle(0x111827).fillRoundedRect(30, 90, 24, 7, 3);
      g.fillRoundedRect(61, 90, 24, 7, 3);
    } else if (jump) {
      g.lineBetween(33, 68, 18, 52);
      g.lineBetween(69, 67, 86, 51);
      g.lineStyle(8, 0x111827).lineBetween(38, 91, 26, 104);
      g.lineBetween(61, 91, 76, 102);
      g.fillStyle(0xffffff).fillRoundedRect(17, 101, 23, 8, 4);
      g.fillRoundedRect(68, 99, 23, 8, 4);
    } else {
      g.lineBetween(32, 66, runB ? 16 : 22, runB ? 78 : 54);
      g.lineBetween(70, 65, runB ? 84 : 88, runB ? 51 : 77);
      g.lineStyle(8, 0x111827).lineBetween(39, 91, runB ? 29 : 44, 104);
      g.lineBetween(61, 91, runB ? 73 : 56, 104);
      g.fillStyle(0xffffff).fillRoundedRect(runB ? 18 : 35, 101, 25, 8, 4);
      g.fillRoundedRect(runB ? 65 : 48, 101, 25, 8, 4);
    }

    g.generateTexture(key, 110, 112);
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
