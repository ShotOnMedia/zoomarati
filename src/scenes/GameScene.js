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
    this.combo = 0;
    this.comboExpiresAt = 0;
    this.shield = false;
    this.magnetUntil = 0;
    this.doubleUntil = 0;
    this.speed = 410;
    this.gameOver = false;
    this.paused = false;
    this.ducking = false;
    this.best = this.mode === 'fun' ? Number(localStorage.getItem('zoomarati-fun-best') || 0) : 0;

    this.createWorld();
    this.createParallax();
    this.createPromoSystem();
    this.createGround();
    this.createPlayer();
    this.createGroups();
    this.createHud();
    this.createInput();

    this.obstacleTimer = this.time.addEvent({ delay: 1650, loop: true, callback: () => this.spawnObstacle() });
    this.collectibleTimer = this.time.addEvent({ delay: 1150, loop: true, callback: () => this.spawnCollectible() });
    this.powerTimer = this.time.addEvent({ delay: 9000, loop: true, callback: () => this.spawnPowerUp() });

    this.runFrame = 0;
    this.runAnimTimer = this.time.addEvent({
      delay: 125, loop: true, callback: () => {
        if (!this.gameOver && !this.paused && !this.ducking && this.isGrounded()) {
          this.runFrame = 1 - this.runFrame;
          this.setOrangeVisual(this.runFrame ? 2 : -2);
        }
      }
    });
  }

  createWorld() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x38bdf8).setDepth(-30);
    this.add.circle(1040, 120, 75, 0xfef08a, .9).setDepth(-29);
    for (let i = 0; i < 9; i++) {
      const w = 150 + (i % 3) * 35;
      const h = 180 + (i % 4) * 35;
      const colors = [0xf97316, 0xec4899, 0x06b6d4, 0x22c55e, 0x8b5cf6];
      this.add.rectangle(i * 165 + 70, GROUND_Y - h / 2, w, h, colors[i % colors.length]).setDepth(-12);
      this.add.rectangle(i * 165 + 70, GROUND_Y - h + 42, w - 25, 32, 0xffffff, .18).setDepth(-11);
    }
    this.add.rectangle(W / 2, GROUND_Y + 55, W, 110, 0x7c4a2d).setDepth(-4);
    this.add.rectangle(W / 2, GROUND_Y + 6, W, 16, 0xd1d5db).setDepth(-3);
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

    this.hillsA = this.add.image(0, 455, 'hills-layer').setOrigin(0, .5).setDepth(-20);
    this.hillsB = this.add.image(this.hillsA.displayWidth, 455, 'hills-layer').setOrigin(0, .5).setDepth(-20);
    this.shopsA = this.add.image(0, 505, 'shops-layer').setOrigin(0, 1).setDepth(-8);
    this.shopsB = this.add.image(this.shopsA.displayWidth, 505, 'shops-layer').setOrigin(0, 1).setDepth(-8);
    this.parallax.push([this.hillsA, this.hillsB, .08], [this.shopsA, this.shopsB, .28]);

    this.roadMarks = [];
    for (let x = 40; x < W + 180; x += 150) {
      this.roadMarks.push(this.add.rectangle(x, 652, 82, 8, 0xfef3c7, .8).setDepth(-2));
    }
  }

  createPromoSystem() {
    const raw = this.cache.json.get('promo-campaigns');
    const now = new Date();
    this.promoCampaigns = (raw?.campaigns || []).filter(campaign => {
      if (!campaign.active) return false;
      if (campaign.start && now < new Date(campaign.start + 'T00:00:00')) return false;
      if (campaign.end && now > new Date(campaign.end + 'T23:59:59')) return false;
      return true;
    });

    this.promoSlots = [];
    this.nextPromoX = W + 420;
    this.spawnPromoSlot('billboard', this.nextPromoX);
    this.spawnPromoSlot('storefront', this.nextPromoX + 720);
  }

  pickPromoCampaign(type) {
    const eligible = this.promoCampaigns.filter(c => c.assets?.[type]);
    if (!eligible.length) return null;

    const weighted = [];
    for (const campaign of eligible) {
      const weight = Phaser.Math.Clamp(Number(campaign.weight) || 1, 1, 20);
      for (let i = 0; i < weight; i++) weighted.push(campaign);
    }
    return Phaser.Math.RND.pick(weighted);
  }

  spawnPromoSlot(type, x) {
    const campaign = this.pickPromoCampaign(type);
    const y = type === 'billboard' ? 330 : 455;
    const width = type === 'billboard' ? 250 : 185;
    const height = type === 'billboard' ? 125 : 145;

    const container = this.add.container(x, y).setDepth(-6);
    const frame = this.add.rectangle(0, 0, width + 14, height + 14, 0x4c1d95)
      .setStrokeStyle(4, 0xfacc15);
    const panel = this.add.rectangle(0, 0, width, height, 0xffffff);
    container.add([frame, panel]);

    if (campaign?.assets?.[type]) {
      const key = 'promo-' + campaign.id + '-' + type;
      const url = '/assets/promo/' + campaign.assets[type];

      if (this.textures.exists(key)) {
        const image = this.add.image(0, 0, key).setDisplaySize(width, height);
        container.add(image);
      } else {
        const label = this.makeHousePromo(type, width, height, campaign.name);
        container.add(label);
        this.load.image(key, url);
        this.load.once('filecomplete-image-' + key, () => {
          if (!container.active) return;
          label.destroy();
          container.add(this.add.image(0, 0, key).setDisplaySize(width, height));
        });
        this.load.start();
      }
      container.setData('campaignId', campaign.id);
    } else {
      container.add(this.makeHousePromo(type, width, height));
      container.setData('campaignId', 'zoomarati-house');
    }

    container.setData('promoType', type);
    this.promoSlots.push(container);
  }

  makeHousePromo(type, width, height, sponsorName = '') {
    const container = this.add.container(0, 0);
    container.add(this.add.rectangle(0, 0, width, height, type === 'billboard' ? 0xec4899 : 0x06b6d4));
    container.add(this.add.text(0, -16, 'ZOOM!', {
      fontSize: type === 'billboard' ? '34px' : '28px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#6d28d9',
      strokeThickness: 6
    }).setOrigin(.5));
    container.add(this.add.text(0, 25, sponsorName || 'IT\'S WHAT\'S INSIDE\nTHAT COUNTS!', {
      fontSize: type === 'billboard' ? '14px' : '12px',
      align: 'center',
      color: '#fef08a'
    }).setOrigin(.5));
    return container;
  }

  updatePromoSlots(dt) {
    for (const slot of this.promoSlots) {
      slot.x -= this.speed * .28 * dt;
      if (slot.x < -320) {
        const furthest = Math.max(...this.promoSlots.map(s => s.x));
        slot.x = furthest + Phaser.Math.Between(620, 880);
      }
    }
  }

  createGround() {
    this.ground = this.add.rectangle(W / 2, GROUND_Y + 14, W, 20, 0x000000, 0);
    this.physics.add.existing(this.ground, true);
  }

  createPlayer() {
    this.player = this.physics.add.sprite(PLAYER_X, GROUND_Y, 'orange-run').setDepth(20);
    this.player.setCollideWorldBounds(true);
    this.setOrangeVisual();
    this.setStandingBody();
    this.physics.add.collider(this.player, this.ground);
  }

  setOrangeVisual(angle = 0) {
    if (!this.player) return;

    this.player.setTexture('orange-run');

    // Never deform Orange to match the physics body. Scale the source artwork
    // uniformly, using its visible central area as the sizing reference.
    const frame = this.player.frame;
    const sourceWidth = frame.realWidth || frame.width;
    const sourceHeight = frame.realHeight || frame.height;
    const visibleHeightRatio = 0.78;
    const targetVisibleHeight = 178;
    const scale = targetVisibleHeight / (sourceHeight * visibleHeightRatio);

    this.player.setScale(scale);
    this.player.setAngle(angle);

    // Anchor the sprite to the character's feet instead of the centre of the
    // source artboard. This makes GROUND_Y mean "feet on pavement".
    this.player.setOrigin(0.5, 0.88);

    // Crop only transparent/artboard padding. The crop is deliberately
    // conservative so gloves, shoes and the cap are never clipped.
    const cropX = Math.round(sourceWidth * 0.08);
    const cropY = Math.round(sourceHeight * 0.04);
    const cropW = Math.round(sourceWidth * 0.84);
    const cropH = Math.round(sourceHeight * 0.90);
    this.player.setCrop(cropX, cropY, cropW, cropH);
  }

  createGroups() {
    this.collectibles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.powerUps = this.physics.add.group({ allowGravity: false, immovable: true });
    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });

    this.physics.add.overlap(this.player, this.collectibles, (_, item) => {
      const x = item.x;
      const y = item.y;
      item.destroy();
      this.bottles += 1;
      this.combo = this.time.now <= this.comboExpiresAt ? Math.min(this.combo + 1, 10) : 1;
      this.comboExpiresAt = this.time.now + 2200;
      const points = 100 * this.combo * (this.time.now < this.doubleUntil ? 2 : 1);
      this.score += points;
      this.popCollectible(x, y, points);
      this.updateHud();
    });

    this.physics.add.overlap(this.player, this.powerUps, (_, item) => this.collectPowerUp(item));
    this.physics.add.overlap(this.player, this.obstacles, (_, obstacle) => this.hitObstacle(obstacle));
  }

  createHud() {
    this.add.text(28, 20, this.mode === 'fun' ? 'FUN MODE' : 'PRIZE RUN', {
      fontSize: '24px', color: '#ffffff', backgroundColor: this.mode === 'fun' ? '#6d28d9' : '#b45309',
      padding: { x: 12, y: 7 }
    }).setDepth(40);

    this.scoreText = this.add.text(28, 62, 'SCORE 000000', this.hudStyle(30)).setDepth(40);
    this.distanceText = this.add.text(28, 104, 'DIST 0000m', this.hudStyle(22)).setDepth(40);
    this.bottleText = this.add.text(28, 137, 'BOTTLES 00', this.hudStyle(22)).setDepth(40);
    this.comboText = this.add.text(28, 170, '', {
      fontSize: '28px', color: '#facc15', stroke: '#111827', strokeThickness: 6
    }).setDepth(40);
    this.bestText = this.add.text(28, 208, 'FUN BEST ' + this.pad(this.best), this.hudStyle(19)).setDepth(40);
    this.powerText = this.add.text(W / 2, 28, '', {
      fontSize: '24px', color: '#ffffff', stroke: '#111827', strokeThickness: 6
    }).setOrigin(.5, 0).setDepth(40);

    this.pauseText = this.add.text(W - 35, 30, 'Ⅱ', {
      fontSize: '36px', color: '#ffffff', stroke: '#111827', strokeThickness: 5
    }).setOrigin(1, 0).setDepth(40).setInteractive({ useHandCursor: true });
    this.pauseText.on('pointerdown', () => this.togglePause());

    this.helpText = this.add.text(W / 2, 675, 'SPACE / TAP TO JUMP  •  ↓ / SWIPE DOWN TO DUCK', this.hudStyle(22)).setOrigin(.5).setDepth(40);
  }

  hudStyle(size) {
    return { fontSize: size + 'px', color: '#ffffff', stroke: '#111827', strokeThickness: 5 };
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.cursors.down.on('down', () => {
      if (this.gameOver || this.paused || this.ducking || !this.isGrounded()) return;
      this.ducking = true;
      this.setDuckBody();
    });

    this.cursors.down.on('up', () => {
      if (!this.ducking) return;
      this.ducking = false;
      this.setStandingBody();
    });

    this.pointerGesture = null;

    this.input.on('pointerdown', pointer => {
      if (this.gameOver) return this.restart();
      if (this.paused) return;

      this.pointerGesture = {
        id: pointer.id,
        startX: pointer.x,
        startY: pointer.y,
        ducked: false
      };
    });

    this.input.on('pointermove', pointer => {
      const gesture = this.pointerGesture;
      if (!gesture || gesture.id !== pointer.id || gesture.ducked || this.gameOver || this.paused) return;

      const dx = pointer.x - gesture.startX;
      const dy = pointer.y - gesture.startY;

      // A deliberate downward drag/swipe becomes a duck. Horizontal movement
      // is tolerated so the gesture feels natural on touch screens and mice.
      if (dy >= 42 && dy > Math.abs(dx) * .7 && this.isGrounded() && !this.ducking) {
        gesture.ducked = true;
        this.ducking = true;
        this.setDuckBody();
      }
    });

    this.input.on('pointerup', pointer => {
      const gesture = this.pointerGesture;
      if (!gesture || gesture.id !== pointer.id) return;

      const dx = pointer.x - gesture.startX;
      const dy = pointer.y - gesture.startY;
      const travel = Math.hypot(dx, dy);

      if (gesture.ducked) {
        this.ducking = false;
        this.setStandingBody();
      } else if (travel < 28 && !this.gameOver && !this.paused) {
        this.jump();
      }

      this.pointerGesture = null;
    });

    this.input.on('pointerupoutside', pointer => {
      if (!this.pointerGesture || this.pointerGesture.id !== pointer.id) return;
      if (this.pointerGesture.ducked) {
        this.ducking = false;
        this.setStandingBody();
      }
      this.pointerGesture = null;
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

    const dt = Math.min(delta, 50) / 1000;
    this.speed = Math.min(760, this.speed + dt * 5);
    this.updateParallax(dt);
    this.updatePromoSlots(dt);
    this.distance += this.speed * dt / 90;
    this.score += dt * 22;
    if (this.combo && this.time.now > this.comboExpiresAt) {
      this.combo = 0;
      this.comboText.setText('');
    }

    for (const item of this.collectibles.getChildren()) {
      item.x -= this.speed * dt;
      if (item.x < -80) item.destroy();
    }
    if (this.time.now < this.magnetUntil) {
      for (const item of this.collectibles.getChildren()) {
        const dx = this.player.x - item.x;
        const dy = this.player.y - item.y;
        if (Math.abs(dx) < 310) {
          item.x += dx * Math.min(1, dt * 7);
          item.y += dy * Math.min(1, dt * 7);
        }
      }
    }
    for (const power of this.powerUps.getChildren()) {
      power.x -= this.speed * dt;
      power.angle += 90 * dt;
      if (power.x < -90) power.destroy();
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
    this.setOrangeVisual();
    this.tweens.add({ targets: this.player, angle: -10, duration: 100, yoyo: true });
  }

  setStandingBody() {
    if (!this.player?.body) return;
    this.setOrangeVisual();
    if (this.isGrounded()) this.player.y = GROUND_Y - 2;

    // Physics stays compact and forgiving; it is intentionally independent
    // of the full artwork bounds.
    const frame = this.player.frame;
    this.player.body.setSize(frame.realWidth * 0.42, frame.realHeight * 0.62, false);
    this.player.body.setOffset(frame.realWidth * 0.29, frame.realHeight * 0.22);
  }

  setDuckBody() {
    this.setOrangeVisual(7);
    this.player.y = GROUND_Y - 2;

    // Duck keeps the same foot anchor and shrinks only the hitbox.
    // No X/Y stretching: Orange keeps his original proportions.
    const frame = this.player.frame;
    this.player.body.setSize(frame.realWidth * 0.48, frame.realHeight * 0.34, false);
    this.player.body.setOffset(frame.realWidth * 0.26, frame.realHeight * 0.50);
  }

  spawnCollectible() {
    if (this.gameOver || this.paused) return;
    const pattern = Phaser.Math.RND.pick(['single', 'line', 'arc']);
    const baseX = W + 70;
    const baseY = Phaser.Math.Between(GROUND_Y - 210, GROUND_Y - 115);
    const count = pattern === 'single' ? 1 : pattern === 'line' ? 3 : 5;

    for (let i = 0; i < count; i++) {
      let y = baseY;
      if (pattern === 'arc') y -= Math.sin((i / (count - 1)) * Math.PI) * 95;
      const bottle = this.collectibles.create(baseX + i * 72, y, 'bottle').setScale(.78).setDepth(15);
      bottle.body.setSize(38, 68);
    }
  }

  spawnPowerUp() {
    if (this.gameOver || this.paused || this.powerUps.countActive(true)) return;
    const type = Phaser.Math.RND.pick(['shield', 'magnet', 'double']);
    const item = this.powerUps.create(W + 90, Phaser.Math.Between(GROUND_Y - 210, GROUND_Y - 110), 'power-' + type).setDepth(16);
    item.powerType = type;
    item.setScale(.9);
  }

  collectPowerUp(item) {
    const type = item.powerType;
    const x = item.x;
    const y = item.y;
    item.destroy();

    if (type === 'shield') this.shield = true;
    if (type === 'magnet') this.magnetUntil = this.time.now + 7000;
    if (type === 'double') this.doubleUntil = this.time.now + 7000;

    const label = type === 'shield' ? 'SHIELD!' : type === 'magnet' ? 'BOTTLE MAGNET!' : '2× ZOOM!';
    const flash = this.add.text(W / 2, 260, label, {
      fontSize: '42px', color: '#facc15', stroke: '#111827', strokeThickness: 8
    }).setOrigin(.5).setDepth(35).setScale(.6);
    this.tweens.add({ targets: flash, scale: 1.15, y: 225, duration: 180, yoyo: true, hold: 350, alpha: 0, onComplete: () => flash.destroy() });
    this.collectSpark(x, y);
    this.cameras.main.flash(100, 255, 255, 255, false);
  }

  hitObstacle(obstacle) {
    if (this.shield) {
      this.shield = false;
      obstacle.destroy();
      this.cameras.main.shake(180, .009);
      const saved = this.add.text(this.player.x + 80, this.player.y - 70, 'SHIELD SAVE!', {
        fontSize: '28px', color: '#22c55e', stroke: '#111827', strokeThickness: 6
      }).setDepth(35);
      this.tweens.add({ targets: saved, y: saved.y - 55, alpha: 0, duration: 650, onComplete: () => saved.destroy() });
      return;
    }
    this.endRun();
  }

  popCollectible(x, y, points) {
    const burst = this.add.text(x, y, '+' + points, {
      fontSize: '25px', color: '#facc15', stroke: '#111827', strokeThickness: 5
    }).setOrigin(.5).setDepth(30);
    this.tweens.add({ targets: burst, y: y - 55, alpha: 0, scale: 1.35, duration: 550, onComplete: () => burst.destroy() });
    this.comboText.setText(this.combo > 1 ? 'ZOOM COMBO x' + this.combo : '');
    if (this.combo > 1) {
      this.cameras.main.shake(70, .0025);
      this.tweens.add({ targets: this.comboText, scale: 1.28, duration: 90, yoyo: true });
    }
    this.collectSpark(x, y);
  }

  collectSpark(x, y) {
    for (let i = 0; i < 7; i++) {
      const dot = this.add.circle(x, y, Phaser.Math.Between(3, 7), Phaser.Math.RND.pick([0xfacc15, 0xffffff, 0xec4899])).setDepth(29);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(35, 85);
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        scale: .2,
        duration: Phaser.Math.Between(280, 520),
        onComplete: () => dot.destroy()
      });
    }
  }

  spawnObstacle() {
    if (this.gameOver || this.paused) return;
    const type = Phaser.Math.RND.pick(['crate', 'puddle', 'barrier', 'awning']);
    let y = GROUND_Y - 35;
    if (type === 'puddle') y = GROUND_Y - 10;
    if (type === 'barrier') y = GROUND_Y - 18;
    if (type === 'awning') y = GROUND_Y - 92;
    const obstacle = this.obstacles.create(W + 100, y, type).setDepth(18);
    if (type === 'puddle') obstacle.body.setSize(95, 28);
    if (type === 'crate') obstacle.body.setSize(62, 64);
    if (type === 'barrier') obstacle.body.setSize(105, 30);
    if (type === 'awning') obstacle.body.setSize(135, 30);

    const nextDelay = Phaser.Math.Clamp(1800 - (this.speed - 410) * 1.7, 900, 1800);
    this.obstacleTimer.delay = Phaser.Math.Between(Math.floor(nextDelay * .82), Math.floor(nextDelay * 1.18));
  }

  updateHud() {
    this.scoreText.setText('SCORE ' + this.pad(this.score));
    this.distanceText.setText('DIST ' + String(Math.floor(this.distance)).padStart(4, '0') + 'm');
    this.bottleText.setText('BOTTLES ' + String(this.bottles).padStart(2, '0'));
    const powers = [];
    if (this.shield) powers.push('🛡 SHIELD');
    if (this.time.now < this.magnetUntil) powers.push('MAGNET ' + Math.ceil((this.magnetUntil - this.time.now) / 1000) + 's');
    if (this.time.now < this.doubleUntil) powers.push('2× ZOOM ' + Math.ceil((this.doubleUntil - this.time.now) / 1000) + 's');
    this.powerText.setText(powers.join('   •   '));
    if (this.ducking) {
      if (this.player.angle !== 7) this.setOrangeVisual(7);
    } else if (this.isGrounded() && Math.abs(this.player.angle) > 3) {
      this.setOrangeVisual();
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
