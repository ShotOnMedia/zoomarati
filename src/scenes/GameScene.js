import Phaser from 'phaser';

const W = 1280;
const H = 720;
const GROUND_Y = 610;
const PLAYER_X = 180;

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.mode = data.mode === 'prize' ? 'prize' : 'fun';
  }

  create() {
    this.score = 0;
    this.distance = 0;
    this.bottles = 0;
    this.speed = 410;
    this.gameOver = false;
    this.paused = false;
    this.ducking = false;
    this.best = this.mode === 'fun' ? Number(localStorage.getItem('zoomarati-fun-best') || 0) : 0;

    this.createWorld();
    this.createParallax();
    this.createGround();
    this.createPlayer();
    this.createGroups();
    this.createHud();
    this.createInput();

    this.obstacleTimer = this.time.addEvent({ delay: 1650, loop: true, callback: () => this.spawnObstacle() });
    this.collectibleTimer = this.time.addEvent({ delay: 1150, loop: true, callback: () => this.spawnCollectible() });

    this.runFrame = 0;
    this.runAnimTimer = this.time.addEvent({
      delay: 125, loop: true, callback: () => {
        if (!this.gameOver && !this.paused && !this.ducking && this.isGrounded()) {
          this.runFrame = 1 - this.runFrame;
          this.player.setTexture(this.runFrame ? 'runner-run-b' : 'runner-run-a');
        }
      }
    });
  }

  createWorld() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x38bdf8);
    this.add.circle(1040, 120, 75, 0xfef08a, .9);
    for (let i = 0; i < 9; i++) {
      const w = 150 + (i % 3) * 35;
      const h = 180 + (i % 4) * 35;
      const colors = [0xf97316, 0xec4899, 0x06b6d4, 0x22c55e, 0x8b5cf6];
      this.add.rectangle(i * 165 + 70, GROUND_Y - h / 2, w, h, colors[i % colors.length]);
      this.add.rectangle(i * 165 + 70, GROUND_Y - h + 42, w - 25, 32, 0xffffff, .18);
    }
    this.add.rectangle(W / 2, GROUND_Y + 55, W, 110, 0x7c4a2d);
    this.add.rectangle(W / 2, GROUND_Y + 6, W, 16, 0xd1d5db);
  }

  createParallax() {
    this.parallax = [];

    const hills = this.add.graphics().setDepth(1);
    hills.fillStyle(0x1d9a8a, .45);
    for (let x = -80; x < W + 180; x += 220) hills.fillCircle(x, 470, 170);
    hills.generateTexture('hills-layer', W + 300, 300);
    hills.destroy();

    const shops = this.add.graphics().setDepth(2);
    const shopColors = [0xf97316, 0xec4899, 0x22c55e, 0x8b5cf6, 0x06b6d4];
    for (let i = 0; i < 8; i++) {
      const x = i * 190;
      const h = 130 + (i % 3) * 35;
      shops.fillStyle(shopColors[i % shopColors.length]).fillRect(x, 220 - h, 165, h);
      shops.fillStyle(0xffffff, .25).fillRect(x + 18, 220 - h + 25, 55, 38);
      shops.fillStyle(0xfacc15).fillRect(x + 18, 195, 128, 18);
    }
    shops.generateTexture('shops-layer', 1520, 230);
    shops.destroy();

    this.hillsA = this.add.image(0, 455, 'hills-layer').setOrigin(0, .5).setDepth(1);
    this.hillsB = this.add.image(this.hillsA.displayWidth, 455, 'hills-layer').setOrigin(0, .5).setDepth(1);
    this.shopsA = this.add.image(0, 505, 'shops-layer').setOrigin(0, 1).setDepth(2);
    this.shopsB = this.add.image(this.shopsA.displayWidth, 505, 'shops-layer').setOrigin(0, 1).setDepth(2);
    this.parallax.push([this.hillsA, this.hillsB, .08], [this.shopsA, this.shopsB, .28]);

    this.roadMarks = [];
    for (let x = 40; x < W + 180; x += 150) {
      this.roadMarks.push(this.add.rectangle(x, 652, 82, 8, 0xfef3c7, .8).setDepth(4));
    }
  }

  createGround() {
    this.ground = this.physics.add.staticImage(W / 2, GROUND_Y + 14, null).setDisplaySize(W, 20).setVisible(false);
    this.ground.refreshBody();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(PLAYER_X, GROUND_Y - 54, 'runner-run-a');
    this.player.setCollideWorldBounds(true);
    this.setStandingBody();
    this.physics.add.collider(this.player, this.ground);
  }

  createGroups() {
    this.collectibles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });

    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      item.destroy();
      this.bottles += 1;
      this.score += 100;
      this.popCollectible(item.x, item.y);
      this.updateHud();
    });

    this.physics.add.overlap(this.player, this.obstacles, () => this.endRun());
  }

  createHud() {
    this.add.text(28, 20, this.mode === 'fun' ? 'FUN MODE' : 'PRIZE RUN', {
      fontSize: '24px', color: '#ffffff', backgroundColor: this.mode === 'fun' ? '#6d28d9' : '#b45309',
      padding: { x: 12, y: 7 }
    });

    this.scoreText = this.add.text(28, 62, 'SCORE 000000', this.hudStyle(30));
    this.distanceText = this.add.text(28, 104, 'DIST 0000m', this.hudStyle(22));
    this.bottleText = this.add.text(28, 137, 'BOTTLES 00', this.hudStyle(22));
    this.bestText = this.add.text(28, 170, 'FUN BEST ' + this.pad(this.best), this.hudStyle(19));

    this.pauseText = this.add.text(W - 35, 30, 'Ⅱ', {
      fontSize: '36px', color: '#ffffff', stroke: '#111827', strokeThickness: 5
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.pauseText.on('pointerdown', () => this.togglePause());

    this.helpText = this.add.text(W / 2, 675, 'SPACE / TAP TO JUMP  •  ↓ TO DUCK', this.hudStyle(24)).setOrigin(.5);
  }

  hudStyle(size) {
    return { fontSize: size + 'px', color: '#ffffff', stroke: '#111827', strokeThickness: 5 };
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.input.on('pointerdown', pointer => {
      if (this.gameOver) return this.restart();
      if (this.paused) return;
      if (pointer.y > H * .72) this.jump();
    });
  }

  update(_, delta) {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey) && !this.gameOver) this.togglePause();
    if (this.paused) return;

    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.space)) this.restart();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.space) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.jump();

    const wantsDuck = this.cursors.down.isDown && this.isGrounded();
    if (wantsDuck !== this.ducking) {
      this.ducking = wantsDuck;
      if (this.ducking) this.setDuckBody(); else this.setStandingBody();
    }

    const dt = Math.min(delta, 50) / 1000;
    this.speed = Math.min(760, this.speed + dt * 5);
    this.updateParallax(dt);
    this.distance += this.speed * dt / 90;
    this.score += dt * 22;

    for (const item of this.collectibles.getChildren()) {
      item.x -= this.speed * dt;
      if (item.x < -80) item.destroy();
    }
    for (const obstacle of this.obstacles.getChildren()) {
      obstacle.x -= this.speed * dt;
      if (obstacle.x < -140) obstacle.destroy();
    }

    this.updateHud();
  }

  updateParallax(dt) {
    for (const [a, b, factor] of this.parallax) {
      const move = this.speed * factor * dt;
      a.x -= move;
      b.x -= move;
      if (a.x + a.displayWidth <= 0) a.x = b.x + b.displayWidth;
      if (b.x + b.displayWidth <= 0) b.x = a.x + a.displayWidth;
    }
    for (const mark of this.roadMarks) {
      mark.x -= this.speed * .72 * dt;
      if (mark.x < -60) mark.x += W + 210;
    }
  }

  isGrounded() {
    return this.player.body.blocked.down || this.player.body.touching.down;
  }

  jump() {
    if (!this.isGrounded() || this.ducking) return;
    this.player.setVelocityY(-780);
    this.player.setTexture('runner-jump');
    this.tweens.add({ targets: this.player, angle: -8, duration: 100, yoyo: true });
  }

  setStandingBody() {
    if (!this.player?.body) return;
    this.player.setTexture('runner-run-a');
    this.player.setScale(1, 1);
    this.player.body.setSize(60, 92);
    this.player.body.setOffset(15, 10);
  }

  setDuckBody() {
    this.player.setTexture('runner-duck');
    this.player.setScale(1, .82);
    this.player.body.setSize(68, 60);
    this.player.body.setOffset(11, 40);
  }

  spawnCollectible() {
    if (this.gameOver || this.paused) return;
    const y = Phaser.Math.Between(GROUND_Y - 230, GROUND_Y - 95);
    this.collectibles.create(W + 60, y, 'bottle').setScale(.78);
  }

  popCollectible(x, y) {
    const burst = this.add.text(x, y, '+100', {
      fontSize: '25px', color: '#facc15', stroke: '#111827', strokeThickness: 5
    }).setOrigin(.5).setDepth(30);
    this.tweens.add({ targets: burst, y: y - 55, alpha: 0, scale: 1.35, duration: 550, onComplete: () => burst.destroy() });
  }

  spawnObstacle() {
    if (this.gameOver || this.paused) return;
    const type = Phaser.Math.RND.pick(['crate', 'puddle', 'barrier']);
    let y = GROUND_Y - 35;
    if (type === 'puddle') y = GROUND_Y - 10;
    if (type === 'barrier') y = GROUND_Y - 18;
    const obstacle = this.obstacles.create(W + 100, y, type);
    if (type === 'puddle') obstacle.body.setSize(95, 28);
    if (type === 'crate') obstacle.body.setSize(62, 64);
    if (type === 'barrier') obstacle.body.setSize(105, 30);

    const nextDelay = Phaser.Math.Clamp(1800 - (this.speed - 410) * 1.7, 900, 1800);
    this.obstacleTimer.delay = Phaser.Math.Between(Math.floor(nextDelay * .82), Math.floor(nextDelay * 1.18));
  }

  updateHud() {
    this.scoreText.setText('SCORE ' + this.pad(this.score));
    this.distanceText.setText('DIST ' + String(Math.floor(this.distance)).padStart(4, '0') + 'm');
    this.bottleText.setText('BOTTLES ' + String(this.bottles).padStart(2, '0'));
    if (!this.ducking && this.isGrounded() && this.player.texture.key === 'runner-jump') {
      this.player.setTexture('runner-run-a');
    }
  }

  togglePause() {
    if (this.gameOver) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.tweens.pauseAll();
      this.pauseOverlay = this.add.rectangle(W / 2, H / 2, W, H, 0x111827, .62).setDepth(50);
      this.pauseLabel = this.add.text(W / 2, H / 2, 'PAUSED\n\nP OR TAP Ⅱ TO RESUME', {
        fontSize: '34px', color: '#ffffff', align: 'center'
      }).setOrigin(.5).setDepth(51);
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      this.pauseOverlay?.destroy();
      this.pauseLabel?.destroy();
    }
  }

  endRun() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.physics.pause();
    const finalScore = Math.floor(this.score);
    if (this.mode === 'fun' && finalScore > this.best) {
      this.best = finalScore;
      localStorage.setItem('zoomarati-fun-best', String(finalScore));
    }

    this.add.rectangle(W / 2, H / 2, 620, 360, 0x111827, .95).setStrokeStyle(6, 0xffffff).setDepth(60);
    this.add.text(W / 2, 245, 'OOPS! YOU LOST YOUR ZOOM!', {
      fontSize: '36px', color: '#facc15'
    }).setOrigin(.5).setDepth(61);
    this.add.text(W / 2, 315,
      'SCORE  ' + this.pad(finalScore) + '\nDISTANCE  ' + Math.floor(this.distance) + 'm\nBOTTLES  ' + this.bottles,
      { fontSize: '27px', color: '#ffffff', align: 'center', lineSpacing: 9 }
    ).setOrigin(.5).setDepth(61);
    this.add.text(W / 2, 430,
      this.mode === 'fun' ? 'FUN RUN • NOT SUBMITTED TO LEADERBOARDS' : 'PRIZE SUBMISSION DISABLED',
      { fontSize: '19px', color: '#facc15' }
    ).setOrigin(.5).setDepth(61);
    this.add.text(W / 2, 485, 'TAP / SPACE TO PLAY AGAIN', {
      fontSize: '22px', color: '#ffffff'
    }).setOrigin(.5).setDepth(61);
    this.add.text(W / 2, 530, 'ESC = MAIN MENU', {
      fontSize: '18px', color: '#ffffff'
    }).setOrigin(.5).setDepth(61);

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  restart() {
    this.scene.restart({ mode: this.mode });
  }

  pad(value) {
    return String(Math.floor(value)).padStart(6, '0');
  }
}
