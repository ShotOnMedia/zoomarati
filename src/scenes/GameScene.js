import Phaser from 'phaser';

const W = 1280;
const H = 720;
const GROUND_Y = 610;
const PLAYER_X = 180;
const ZOOM_FLAVOURS = ['orange', 'mango', 'apple', 'pineapple', 'raspberry', 'blueberry'];

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
    // Base world: sky, distant haze, pavement and road. Decorative buildings
    // now live in the parallax scenery layers rather than being fixed blocks.
    this.add.rectangle(W / 2, H / 2, W, H, 0x38bdf8).setDepth(-30);
    this.add.rectangle(W / 2, 425, W, 190, 0x7dd3fc, .35).setDepth(-29);
    this.add.circle(1040, 120, 75, 0xfef08a, .9).setDepth(-28);

    this.add.rectangle(W / 2, GROUND_Y + 55, W, 110, 0x7c4a2d).setDepth(-4);
    this.add.rectangle(W / 2, GROUND_Y + 6, W, 16, 0xd1d5db).setDepth(-3);
    this.add.rectangle(W / 2, GROUND_Y - 5, W, 5, 0xf8fafc, .9).setDepth(-3);
  }

  createParallax() {
    this.parallax = [];

    // Distant Joburg-ish ridge / urban silhouette. It moves slowly enough to
    // sell depth without competing with gameplay.
    const skyline = this.add.graphics();
    skyline.fillStyle(0x0f766e, .30);
    skyline.fillEllipse(190, 245, 430, 160);
    skyline.fillEllipse(560, 250, 520, 145);
    skyline.fillEllipse(1040, 240, 560, 170);
    skyline.fillStyle(0x155e75, .28);
    for (let x = 40; x < 1600; x += 95) {
      const h = 38 + ((x / 95) % 4) * 14;
      skyline.fillRect(x, 265 - h, 58, h);
    }
    skyline.generateTexture('skyline-layer', 1600, 300);
    skyline.destroy();

    // Midground street: actual shop façades, doors, windows, awnings, roof
    // signs and little pavement details instead of anonymous colour blocks.
    const street = this.add.graphics();
    const shopColors = [0xf97316, 0xec4899, 0x06b6d4, 0x22c55e, 0x8b5cf6, 0xf59e0b];
    const trimColors = [0xfef3c7, 0xffffff, 0xfacc15];
    for (let i = 0; i < 9; i++) {
      const x = i * 205;
      const w = 185;
      const h = 175 + (i % 3) * 24;
      const top = 250 - h;

      street.fillStyle(0x111827, .18).fillRect(x + 7, top + 7, w, h);
      street.fillStyle(shopColors[i % shopColors.length]).fillRect(x, top, w, h);
      street.fillStyle(trimColors[i % trimColors.length]).fillRect(x, top, w, 12);

      // Upper window.
      street.fillStyle(0xbff3ff, .75).fillRect(x + 20, top + 28, 62, 47);
      street.fillStyle(0xffffff, .35).fillRect(x + 27, top + 34, 18, 35);
      street.lineStyle(4, 0xffffff, .55).strokeRect(x + 20, top + 28, 62, 47);

      // Shop sign panel.
      street.fillStyle(0x4c1d95).fillRoundedRect(x + 18, top + 90, 149, 34, 6);
      street.fillStyle(0xfacc15).fillRect(x + 28, top + 101, 129, 11);

      // Ground-floor display window and door.
      street.fillStyle(0x164e63, .82).fillRect(x + 18, top + 136, 98, h - 136);
      street.fillStyle(0x67e8f9, .35).fillRect(x + 25, top + 143, 84, Math.max(18, h - 151));
      street.fillStyle(0x3f3f46).fillRect(x + 130, top + 136, 37, h - 136);
      street.fillStyle(0xfacc15).fillCircle(x + 157, top + h - 28, 3);

      // Striped awning.
      for (let a = 0; a < 5; a++) {
        street.fillStyle(a % 2 ? 0xffffff : 0xfacc15).fillRect(x + 18 + a * 30, top + 124, 30, 13);
      }
    }
    street.generateTexture('street-layer', 1845, 260);
    street.destroy();

    this.skylineA = this.add.image(0, 390, 'skyline-layer').setOrigin(0, 1).setDepth(-20);
    this.skylineB = this.add.image(this.skylineA.displayWidth, 390, 'skyline-layer').setOrigin(0, 1).setDepth(-20);
    this.shopsA = this.add.image(0, 600, 'street-layer').setOrigin(0, 1).setDepth(-8);
    this.shopsB = this.add.image(this.shopsA.displayWidth, 600, 'street-layer').setOrigin(0, 1).setDepth(-8);
    this.parallax.push([this.skylineA, this.skylineB, .07], [this.shopsA, this.shopsB, .28]);

    // Foreground road markings and decorative pavement props have their own
    // scroll rates so the street feels layered.
    this.roadMarks = [];
    for (let x = 40; x < W + 180; x += 150) {
      this.roadMarks.push(this.add.rectangle(x, 652, 82, 8, 0xfef3c7, .8).setDepth(-2));
    }

    this.sceneryProps = [];
    for (let x = 520; x < W + 800; x += 430) this.spawnSceneryProp(x);
  }

  spawnSceneryProp(x) {
    const type = Phaser.Math.RND.pick(['lamp', 'planter', 'bin']);
    const prop = this.add.container(x, GROUND_Y - 7).setDepth(-5);

    if (type === 'lamp') {
      prop.add(this.add.rectangle(0, -62, 7, 112, 0x334155));
      prop.add(this.add.circle(0, -122, 15, 0xfef08a).setStrokeStyle(5, 0x334155));
    } else if (type === 'planter') {
      prop.add(this.add.rectangle(0, -18, 58, 31, 0x92400e));
      prop.add(this.add.circle(-14, -43, 21, 0x16a34a));
      prop.add(this.add.circle(10, -49, 25, 0x22c55e));
      prop.add(this.add.circle(27, -39, 17, 0x15803d));
    } else {
      prop.add(this.add.rectangle(0, -27, 42, 51, 0x475569).setStrokeStyle(3, 0x1e293b));
      prop.add(this.add.rectangle(0, -54, 48, 8, 0x1e293b));
    }

    prop.setData('propType', type);
    this.sceneryProps.push(prop);
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
      const weight = Phaser.Math.Clamp(Number(campaign.weight) || 1, 1, 100);
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

    for (const prop of this.sceneryProps) {
      prop.x -= this.speed * .42 * dt;
      if (prop.x < -100) {
        const furthest = Math.max(...this.sceneryProps.map(p => p.x));
        prop.x = furthest + Phaser.Math.Between(340, 520);
      }
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
      const flavour = Phaser.Math.RND.pick(ZOOM_FLAVOURS);
      const bottle = this.collectibles.create(baseX + i * 72, y, 'zoom-' + flavour).setScale(.82).setDepth(15);
      bottle.setData('flavour', flavour);
      bottle.body.setSize(42, 64);
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
