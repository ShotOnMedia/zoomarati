import Phaser from 'phaser';

const WIDTH = 1280;
const HEIGHT = 720;
const GROUND_Y = 610;

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.best = Number(localStorage.getItem('zoomarati-best') || 0);
    this.speed = 410;
    this.gameOver = false;

    this.createWorld();
    this.createPlayer();
    this.createGroups();
    this.createHud();
    this.createInput();

    this.time.addEvent({
      delay: 1250,
      loop: true,
      callback: () => this.spawnCollectible()
    });

    this.time.addEvent({
      delay: 1850,
      loop: true,
      callback: () => this.spawnObstacle()
    });
  }

  createWorld() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x38bdf8);
    this.add.circle(1040, 120, 75, 0xfef08a, 0.9);

    for (let i = 0; i < 9; i++) {
      const w = 150 + (i % 3) * 35;
      const h = 180 + (i % 4) * 35;
      const colors = [0xf97316, 0xec4899, 0x06b6d4, 0x22c55e, 0x8b5cf6];
      this.add.rectangle(i * 165 + 70, GROUND_Y - h / 2, w, h, colors[i % colors.length]);
      this.add.rectangle(i * 165 + 70, GROUND_Y - h + 42, w - 25, 32, 0xffffff, 0.18);
    }

    this.add.rectangle(WIDTH / 2, GROUND_Y + 55, WIDTH, 110, 0x7c4a2d);
    this.add.rectangle(WIDTH / 2, GROUND_Y + 6, WIDTH, 16, 0xd1d5db);
    this.add.text(WIDTH / 2, 52, 'ZOOMARATI', {
      fontFamily: 'Impact, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#111827',
      strokeThickness: 10
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 118, 'STAY ZOOM!', {
      fontSize: '24px',
      color: '#facc15',
      stroke: '#111827',
      strokeThickness: 5
    }).setOrigin(0.5);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(180, GROUND_Y - 52, 'runner');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(60, 92);
    this.player.body.setOffset(15, 10);
  }

  createGroups() {
    this.collectibles = this.physics.add.group({ allowGravity: false });
    this.obstacles = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      item.destroy();
      this.score += 100;
      this.scoreText.setText(this.pad(this.score));
    });

    this.physics.add.overlap(this.player, this.obstacles, () => this.endRun());
  }

  createHud() {
    this.add.text(34, 28, 'SCORE', {
      fontSize: '30px',
      color: '#ffffff',
      stroke: '#111827',
      strokeThickness: 6
    });

    this.scoreText = this.add.text(32, 60, this.pad(this.score), {
      fontSize: '58px',
      color: '#facc15',
      stroke: '#111827',
      strokeThickness: 8
    });

    this.bestText = this.add.text(36, 130, `BEST: ${this.pad(this.best)}`, {
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#111827',
      strokeThickness: 5
    });

    this.helpText = this.add.text(WIDTH / 2, 675, 'SPACE / TAP TO JUMP', {
      fontSize: '28px',
      color: '#facc15',
      stroke: '#111827',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.input.on('pointerdown', () => {
      if (this.gameOver) return this.restart();
      this.jump();
    });
  }

  update(_, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.space)) this.restart();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.jump();
    }

    const dt = delta / 1000;
    this.score += Math.floor(dt * 20);
    this.speed = Math.min(720, this.speed + dt * 4);
    this.scoreText.setText(this.pad(this.score));

    for (const item of this.collectibles.getChildren()) {
      item.x -= this.speed * dt;
      if (item.x < -60) item.destroy();
    }

    for (const obstacle of this.obstacles.getChildren()) {
      obstacle.x -= this.speed * dt;
      if (obstacle.x < -100) obstacle.destroy();
    }
  }

  jump() {
    const grounded = this.player.body.blocked.down || this.player.body.touching.down || this.player.y >= GROUND_Y - 53;
    if (grounded) {
      this.player.setVelocityY(-760);
      this.tweens.add({
        targets: this.player,
        angle: -8,
        duration: 100,
        yoyo: true
      });
    }
  }

  spawnCollectible() {
    if (this.gameOver) return;
    const y = Phaser.Math.Between(GROUND_Y - 230, GROUND_Y - 90);
    const bottle = this.collectibles.create(WIDTH + 60, y, 'bottle');
    bottle.setScale(0.78);
  }

  spawnObstacle() {
    if (this.gameOver) return;
    const obstacle = this.obstacles.create(WIDTH + 80, GROUND_Y - 35, 'obstacle');
    obstacle.body.setSize(62, 64);
  }

  endRun() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();

    if (this.score > this.best) {
      this.best = this.score;
      localStorage.setItem('zoomarati-best', String(this.best));
      this.bestText.setText(`BEST: ${this.pad(this.best)}`);
    }

    this.add.rectangle(WIDTH / 2, HEIGHT / 2, 560, 260, 0x111827, 0.92)
      .setStrokeStyle(6, 0xffffff);
    this.add.text(WIDTH / 2, 285, 'OOPS! YOU LOST YOUR ZOOM!', {
      fontSize: '34px',
      color: '#facc15',
      align: 'center'
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 350, `SCORE  ${this.pad(this.score)}`, {
      fontSize: '30px',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(WIDTH / 2, 410, 'TAP OR PRESS SPACE TO GO AGAIN', {
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  restart() {
    this.scene.restart();
  }

  pad(value) {
    return String(Math.floor(value)).padStart(6, '0');
  }
}
