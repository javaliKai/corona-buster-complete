import Phaser from 'phaser';
import FallingObject from '../ui/FallingObject';
import Laser from '../ui/Laser';

export default class CoronaBusterScene extends Phaser.Scene {
  constructor() {
    // nama scene
    super('corona-buster-scene');
  }

  init() {
    // Clouds
    this.clouds = undefined;

    // Creating buttons
    this.nav_left = false;
    this.nav_right = false;
    this.shoot = false;

    // Player
    this.player = undefined;
    this.speed = 100;

    // Cursor keyboard
    this.cursor = undefined;

    // Enemy
    this.enemies = undefined;
    this.enemySpeed = 50;

    // Laser
    this.lasers = undefined;
    this.lastFired = 10; // distance between lasers fired

    // scoring & life
    this.scoreLabel = undefined;
    this.score = 0;
    this.lifeLabel = undefined;
    this.life = 3;

    // Power up
    this.handSanitizer = undefined;

    // Backsound
    this.backsound = undefined;
  }

  preload() {
    this.load.image('background', 'images/bg_layer1.png');
    this.load.image('cloud', 'images/cloud.png');
    this.load.image('left-btn', 'images/left-btn.png');
    this.load.image('right-btn', 'images/right-btn.png');
    this.load.image('shoot-btn', 'images/shoot-btn.png');
    this.load.spritesheet('player', 'images/ship.png', {
      frameWidth: 66,
      frameHeight: 66,
    });

    this.load.image('enemy', 'images/enemy.png');
    this.load.spritesheet('laser', 'images/laser-bolts.png', {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image('handSanitizer', 'images/handsanitizer.png');

    this.load.audio('bgsound', 'backsound/AloneAgainst Enemy.ogg');

    this.load.audio('laser', 'sfx/sfx_laser.ogg');
    this.load.audio('destroy', 'sfx/destroy.mp3');
    this.load.audio('life', 'sfx/handsanitizer.mp3');
    this.load.audio('gameover', 'sfx/gameover.wav');
  }

  create() {
    // Bg
    const gameWidth = this.scale.width * 0.5;
    const gameHeight = this.scale.height * 0.5;

    this.add.image(gameWidth, gameHeight, 'background');

    // Clouds
    this.clouds = this.physics.add.group({
      key: 'cloud',
      repeat: 10,
    });

    // Atur posisi acak dalam bentuk rectangle
    Phaser.Actions.RandomRectangle(
      this.clouds.getChildren(),
      this.physics.world.bounds
    );

    // Create buttons
    this.createButtons();

    // Create player ship
    this.player = this.createPlayer();

    // Cursors input for keyboard
    this.cursor = this.input.keyboard.createCursorKeys();

    // Enemy
    this.enemies = this.physics.add.group({
      classType: FallingObject,
      maxSize: 10,
      runChildUpdate: true, // calls update() method in FallingObject
    });

    this.time.addEvent({
      // timer event, create a time interval when executing a function
      delay: Phaser.Math.Between(1000, 5000), // in ms
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // Lasers
    this.lasers = this.physics.add.group({
      classType: Laser,
      maxSize: 10,
      runChildUpdate: true,
    });

    // When laser hit enemy
    this.physics.add.overlap(
      this.enemies,
      this.lasers,
      this.hitEnemy,
      null,
      this
    );

    // Scoring & life
    this.scoreLabel = this.add
      .text(10, 10, 'Score', {
        fontSize: '16px',
        //@ts-ignore
        fill: 'black',
        backgroundColor: 'white',
      })
      .setDepth(1);

    this.lifeLabel = this.add
      .text(this.scoreLabel.x, this.scoreLabel.y + 25, 'Life', {
        fontSize: '16px',
        //@ts-ignore
        fill: 'black',
        backgroundColor: 'white',
      })
      .setDepth(1);

    // When enemy hits player
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.decreaseLife,
      null,
      this
    );

    // Handsanitizer power up
    this.handSanitizer = this.physics.add.group({
      classType: FallingObject,
      runChildUpdate: true,
    });

    this.time.addEvent({
      delay: 10000,
      callback: this.spawnHandSanitizer,
      callbackScope: this,
      loop: true,
    });

    // When player gets powerup
    this.physics.add.overlap(
      this.player,
      this.handSanitizer,
      this.increaseLife,
      null,
      this
    );

    // Background music
    this.backsound = this.sound.add('bgsound');

    let soundConfig = {
      loop: true,
      volume: 0.5,
    };

    this.backsound.play(soundConfig);
  }

  update(time) {
    // buat awan bergerak ke bawah
    this.clouds.children.iterate((child) => {
      // @ts-ignore
      child.setVelocityY(20); // ignore error here

      // Buat awannya ada terus diulang ulang
      // @ts-ignore

      if (child.y > this.scale.height) {
        // @ts-ignore
        child.x = Phaser.Math.Between(10, 400); // random nums from 10 400 inclusive

        // @ts-ignore
        child.y = 0;
      }
    });

    // Moving player
    this.movePlayer(this.player, time);

    // Scoring & life
    this.scoreLabel.setText('Score: ' + this.score);
    this.lifeLabel.setText('Life: ' + this.life);
  }

  createButtons() {
    this.input.addPointer(3);

    let shoot = this.add
      .image(320, 550, 'shoot-btn')
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    let nav_left = this.add
      .image(50, 550, 'left-btn')
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    let nav_right = this.add
      .image(nav_left.x + nav_left.displayWidth + 20, 550, 'right-btn')
      .setInteractive()
      .setDepth(0.5)
      .setAlpha(0.8);

    nav_left.on(
      'pointerdown',
      () => {
        this.nav_left = true;
      },
      this
    );

    nav_left.on(
      'pointerout',
      () => {
        this.nav_left = false;
      },
      this
    );

    nav_right.on(
      'pointerdown',
      () => {
        this.nav_right = true;
      },
      this
    );

    nav_right.on(
      'pointerout',
      () => {
        this.nav_right = false;
      },
      this
    );

    shoot.on(
      'pointerdown',
      () => {
        this.shoot = true;
      },
      this
    );

    shoot.on(
      'pointerout',
      () => {
        this.shoot = false;
      },
      this
    );
  }

  movePlayer(player, time) {
    if (this.cursor.left.isDown || this.nav_left) {
      this.player.setVelocityX(this.speed * -1);
      this.player.anims.play('left', true);
      this.player.setFlipX(false);
    } else if (this.cursor.right.isDown || this.nav_right) {
      this.player.setVelocityX(this.speed);
      this.player.anims.play('right', true);
      this.player.setFlipX(true);
    } else if (this.cursor.up.isDown) {
      this.player.setVelocity(0, this.speed * -1);
      this.player.anims.play('turn', true);
    } else if (this.cursor.down.isDown) {
      this.player.setVelocity(0, this.speed);
      this.player.anims.play('turn', true);
    } else {
      this.player.setVelocity(0);
      this.player.anims.play('turn');
    }

    // a bug: it will keep shooting on mouse hover
    if (this.shoot && time > this.lastFired) {
      const laser = this.lasers.get(0, 0, 'laser');
      if (laser) {
        laser.fire(this.player.x, this.player.y);
        this.lastFired = time + 500;
        this.sound.play('laser');
      }
    }
  }

  createPlayer() {
    const player = this.physics.add.sprite(200, 450, 'player');
    player.setCollideWorldBounds(true);

    // Player animations
    this.anims.create({
      key: 'turn',
      frames: [
        {
          key: 'player',
          frame: 0,
        },
      ],
    });

    // It's kinda weird bcs the animation has only the one to turn left
    // We'll gonna mirror it later with setFlipX()
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', {
        start: 1,
        end: 2,
      }),
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', {
        start: 1,
        end: 2,
      }),
    });

    return player;
  }

  spawnEnemy() {
    const config = {
      speed: 30,
      rotation: 0.1,
    };

    //@ts-ignore
    const enemy = this.enemies.get(0, 0, 'enemy', config).setScale(0.5);
    const positionX = Phaser.Math.Between(50, 350);
    if (enemy) {
      enemy.spawn(positionX);
    }
  }

  hitEnemy(laser, enemy) {
    laser.die();
    enemy.die();

    // Scoring logic
    this.score += 10;
    this.sound.play('destroy');
  }

  decreaseLife(player, enemy) {
    // When enemy hits player logic
    enemy.die();
    this.life--;

    if (this.life === 2) {
      player.setTint(0xff0000); // change obj's color with hex code color
    } else if (this.life === 1) {
      player.setTint(0xff0000).setAlpha(0.2);
    } else if (this.life === 0) {
      // change current scene to GameOverScene with 'over-scene' as the name
      this.sound.stopAll(); // stop all playing sounds
      this.sound.play('gameover');
      this.scene.start('over-scene', { score: this.score });
    }
  }

  spawnHandSanitizer() {
    const config = {
      speed: 60,
      rotation: 0,
    };

    //@ts-ignore
    const handSanitizer = this.handSanitizer.get(0, 0, 'handSanitizer', config);

    const positionX = Phaser.Math.Between(70, 330);

    if (handSanitizer) {
      handSanitizer.spawn(positionX);
    }
  }

  increaseLife(player, handSanitizer) {
    handSanitizer.die();
    this.life++;
    this.sound.play('life');
    if (this.life >= 3) {
      player.clearTint().setAlpha(2);
    }
  }
}
