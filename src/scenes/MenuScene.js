import Phaser from 'phaser';

const W = 1280;
const H = 720;

export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x38bdf8);
    this.add.circle(1030, 115, 80, 0xfef08a, .9);

    this.add.text(W / 2, 95, 'ZOOMARATI', {
      fontFamily: 'Impact, sans-serif', fontSize: '92px', color: '#ffffff',
      stroke: '#111827', strokeThickness: 12
    }).setOrigin(.5);
    this.add.text(W / 2, 170, 'HOW FAR CAN YOU ZOOM?', {
      fontSize: '30px', color: '#facc15', stroke: '#111827', strokeThickness: 6
    }).setOrigin(.5);

    this.makeButton(410, 350, 360, 150, 0x6d28d9, 'PLAY FOR FUN', 'Instant play • local best only', () => {
      this.scene.start('GameScene', { mode: 'fun' });
    });

    this.makeButton(870, 350, 360, 150, 0xf59e0b, 'PLAY FOR PRIZES', 'Verified leaderboards • coming soon', () => {
      this.showPrizeInfo();
    });

    this.add.text(W / 2, 520,
      'Fun runs never enter prize leaderboards.\nPrize runs will require a fresh verified session.',
      { fontSize: '22px', align: 'center', color: '#ffffff', stroke: '#111827', strokeThickness: 4 }
    ).setOrigin(.5);

    this.add.text(W / 2, 650, 'SPACE / ↑ / TAP = JUMP     •     ↓ = DUCK     •     P = PAUSE', {
      fontSize: '20px', color: '#ffffff', stroke: '#111827', strokeThickness: 4
    }).setOrigin(.5);
  }

  makeButton(x, y, w, h, color, title, subtitle, onClick) {
    const bg = this.add.rectangle(x, y, w, h, color).setStrokeStyle(6, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(x, y - 18, title, { fontSize: '34px', color: '#ffffff', stroke: '#111827', strokeThickness: 5 }).setOrigin(.5);
    this.add.text(x, y + 28, subtitle, { fontSize: '17px', color: '#ffffff' }).setOrigin(.5);
    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => bg.setScale(1.03));
    bg.on('pointerout', () => bg.setScale(1));
  }

  showPrizeInfo() {
    if (this.prizePanel) return;
    this.prizePanel = this.add.container(0, 0).setDepth(20);
    const shade = this.add.rectangle(W / 2, H / 2, W, H, 0x111827, .72).setInteractive();
    const card = this.add.rectangle(W / 2, H / 2, 650, 310, 0x111827, .98).setStrokeStyle(6, 0xfacc15);
    const title = this.add.text(W / 2, 285, 'PRIZE MODE IS COMING', { fontSize: '38px', color: '#facc15' }).setOrigin(.5);
    const copy = this.add.text(W / 2, 360,
      'We will only enable prize runs once account login,\nserver-issued sessions and score validation are live.\n\nNo prototype score can accidentally qualify for a prize.',
      { fontSize: '21px', color: '#ffffff', align: 'center', lineSpacing: 8 }
    ).setOrigin(.5);
    const close = this.add.text(W / 2, 455, 'BACK', { fontSize: '28px', color: '#ffffff', backgroundColor: '#6d28d9', padding: { x: 35, y: 14 } })
      .setOrigin(.5).setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => { this.prizePanel.destroy(true); this.prizePanel = null; });
    this.prizePanel.add([shade, card, title, copy, close]);
  }
}
