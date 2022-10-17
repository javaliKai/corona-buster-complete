import Phaser from 'phaser';

export default class Laser extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    this.setScale(2);
  }

  fire(x, y) {
    // adjust to player's current position
    this.setPosition(x, y - 50);
    this.setActive(true);
    this.setVisible(true);
  }

  die() {
    this.destroy();
  }

  update(time) {
    // move up
    this.setVelocityY(-200);

    // remove when out ouf scene's boundary
    if (this.y < -10) {
      this.die();
    }
  }
}
