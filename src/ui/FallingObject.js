import Phaser from 'phaser';

export default class FallingObject extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    this.scene = scene;

    // Config obj retrieved from GameConfig
    this.speed = config.speed;
    this.rotationVal = config.rotation;
  }

  spawn(positionX) {
    this.setPosition(positionX, -10);
    this.setActive(true);
    this.setVisible(true);
  }

  die() {
    this.destroy();
  }

  update(time) {
    // Make the obj move downward and spin
    this.setVelocityY(this.speed);
    this.rotation += this.rotationVal;

    // Make the obj disappear when passing down the bottom scene
    const gameHeight = this.scene.scale.height;
    if (this.y > gameHeight + 5) {
      this.die();
    }
  }
}
