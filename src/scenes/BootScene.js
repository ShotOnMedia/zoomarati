import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.image('orange-run', '/assets/characters/orange-run.webp');

    // Optional campaign artwork. Missing promo files never block gameplay;
    // campaigns.json decides which real assets are enabled.
    this.load.json('promo-campaigns', '/assets/promo/campaigns.json');
  }

  create() {
    const g = this.add.graphics();

    // OG Potato is intentionally preserved as the fallback/secret character.
    // Polished character assets can replace the active runner keys later without
    // deleting the original prototype mascot.
    this.makeRunner(g, 'og-potato-run-a', 0);
    this.makeRunner(g, 'og-potato-run-b', 5);
    this.makeRunner(g, 'og-potato-jump', -7);
    this.makeDuckRunner(g, 'og-potato-duck');

    // Active character uses the original Orange artwork loaded above.
    // OG Potato remains generated below as the permanent prototype fallback.

    // Flavour-aware Zoom collectibles. These generated pouches are fallbacks;
    // final product PNG/WebP art can later use the same texture keys.
    const flavours = [
      ['orange', 0xf97316, 0xffd166],
      ['mango', 0xf59e0b, 0xa3e635],
      ['apple', 0x22c55e, 0xd9f99d],
      ['pineapple', 0xfacc15, 0xfef08a],
      ['raspberry', 0xec4899, 0xf9a8d4],
      ['blueberry', 0x2563eb, 0x93c5fd]
    ];
    for (const [name, colour, accent] of flavours) this.makeZoomPouch(g, 'zoom-' + name, colour, accent);

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

  makeZoomPouch(g, key, colour, accent) {
    g.clear();

    // Compact stand-up pouch silhouette inspired by the product family,
    // deliberately generic until supplied product artwork is available.
    g.fillStyle(0x111827, .22).fillRoundedRect(7, 7, 50, 76, 9);
    g.fillStyle(colour).fillRoundedRect(4, 3, 50, 76, 9);
    g.fillStyle(accent, .9).fillRoundedRect(8, 8, 42, 18, 5);
    g.fillStyle(0xffffff, .88).fillEllipse(29, 47, 35, 31);
    g.fillStyle(0xef4444).fillRoundedRect(10, 31, 38, 19, 7);
    g.fillStyle(0xffffff).fillRect(15, 37, 28, 6);
    g.fillStyle(0x6d28d9).fillRoundedRect(12, 57, 34, 12, 5);
    g.fillStyle(0xffffff).fillRect(17, 61, 24, 4);
    g.fillStyle(accent).fillTriangle(44, 8, 54, 17, 46, 26);
    g.generateTexture(key, 62, 86);
  }

  makeZoomRunner(g, key, pose) {
    g.clear();

    const duck = pose === 'duck';
    const jump = pose === 'jump';
    const runB = pose === 'run-b';
    const outline = 0x4a1f16;
    const orange = 0xf47a20;
    const red = 0xd9362b;
    const face = 0xffc52f;
    const blue = 0x36b9ee;

    // Arms sit behind the fruit body. The pose changes, but the character
    // keeps the same round silhouette as the original Zoom artwork.
    g.lineStyle(8, orange);
    if (duck) {
      g.lineBetween(30, 62, 12, 75);
      g.lineBetween(82, 61, 101, 70);
    } else if (jump) {
      g.lineBetween(31, 58, 12, 40);
      g.lineBetween(82, 56, 102, 35);
    } else {
      g.lineBetween(31, 59, runB ? 13 : 18, runB ? 76 : 42);
      g.lineBetween(82, 57, runB ? 100 : 96, runB ? 39 : 75);
    }

    // Blue cartoon gloves.
    g.fillStyle(blue);
    const hands = duck ? [[10, 76], [103, 70]] :
      jump ? [[10, 39], [103, 34]] :
      runB ? [[11, 78], [102, 38]] : [[16, 40], [98, 76]];
    for (const [x, y] of hands) {
      g.fillCircle(x, y, 8);
      g.fillCircle(x - 6, y - 5, 4);
      g.fillCircle(x, y - 8, 4);
      g.fillCircle(x + 6, y - 5, 4);
    }

    // Round orange/red fruit body with warm face patch.
    g.fillStyle(outline).fillEllipse(56, duck ? 60 : 54, duck ? 91 : 84, duck ? 59 : 82);
    g.fillStyle(red).fillEllipse(54, duck ? 60 : 54, duck ? 86 : 79, duck ? 54 : 77);
    g.fillStyle(orange).fillEllipse(60, duck ? 55 : 47, duck ? 72 : 67, duck ? 43 : 61);
    g.fillStyle(face).fillEllipse(68, duck ? 58 : 51, duck ? 58 : 54, duck ? 38 : 48);

    // Small tilted cap from the original character.
    g.fillStyle(outline).fillEllipse(54, duck ? 34 : 20, 48, 13);
    g.fillStyle(0xe5b52e).fillEllipse(54, duck ? 32 : 18, 44, 10);
    g.fillStyle(0x8b5a2b).fillRect(35, duck ? 27 : 13, 39, 7);
    g.fillStyle(0xe5b52e).fillEllipse(73, duck ? 30 : 16, 24, 7);

    // Eyes, brows and oversized happy Zoom grin.
    const eyeY = duck ? 49 : 40;
    g.fillStyle(0xffffff).fillEllipse(60, eyeY, 15, 21);
    g.fillEllipse(76, eyeY + 1, 15, 21);
    g.fillStyle(0x2563a6).fillCircle(63, eyeY + 2, 5);
    g.fillCircle(79, eyeY + 3, 5);
    g.fillStyle(0x111827).fillCircle(64, eyeY + 2, 2);
    g.fillCircle(80, eyeY + 3, 2);
    g.lineStyle(3, outline).lineBetween(52, eyeY - 13, 64, eyeY - 16);
    g.lineBetween(73, eyeY - 15, 84, eyeY - 11);
    g.fillStyle(orange).fillEllipse(70, eyeY + 14, 11, 8);
    g.fillStyle(outline).fillEllipse(72, eyeY + 25, 29, 19);
    g.fillStyle(0xffffff).fillEllipse(72, eyeY + 20, 22, 8);
    g.fillStyle(0xe9425c).fillEllipse(73, eyeY + 29, 14, 7);

    // Legs and blue/white sneakers. Duck tucks both feet beneath the body.
    g.lineStyle(7, orange);
    if (duck) {
      g.lineBetween(42, 81, 32, 91);
      g.lineBetween(72, 82, 82, 91);
      this.makeZoomShoe(g, 25, 88, false);
      this.makeZoomShoe(g, 77, 88, true);
    } else if (jump) {
      g.lineBetween(42, 88, 27, 101);
      g.lineBetween(70, 88, 86, 99);
      this.makeZoomShoe(g, 16, 97, false);
      this.makeZoomShoe(g, 81, 95, true);
    } else if (runB) {
      g.lineBetween(42, 88, 25, 102);
      g.lineBetween(69, 88, 83, 99);
      this.makeZoomShoe(g, 14, 98, false);
      this.makeZoomShoe(g, 78, 95, true);
    } else {
      g.lineBetween(43, 88, 57, 101);
      g.lineBetween(69, 88, 54, 102);
      this.makeZoomShoe(g, 50, 98, true);
      this.makeZoomShoe(g, 38, 99, false);
    }

    g.generateTexture(key, 116, 116);
  }

  makeZoomShoe(g, x, y, flip) {
    g.fillStyle(0x163b73).fillRoundedRect(x, y, 25, 12, 6);
    g.fillStyle(0xffffff).fillRoundedRect(x + (flip ? 1 : 5), y + 2, 17, 7, 4);
    g.fillStyle(0x36b9ee).fillRect(x + (flip ? 14 : 3), y + 1, 8, 8);
    g.fillStyle(0xfacc15).fillRect(x + 2, y + 9, 21, 3);
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
