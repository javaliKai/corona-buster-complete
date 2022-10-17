import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('start-scene');
  }

  init() {
    this.startButton = undefined;
  }

  preload() {
    this.load.image('background', 'images/bg_layer1.png');
    this.load.image('start-button', 'images/start-button.png');
  }

  create() {
    this.add.image(200, 320, 'background');

    this.startButton = this.add
      .image(200, 300, 'start-button')
      .setInteractive()
      .setScale(0.3);

    this.startButton.once(
      'pointerup',
      () => {
        this.scene.start('corona-buster-scene');
      },
      this
    );
  }
}
