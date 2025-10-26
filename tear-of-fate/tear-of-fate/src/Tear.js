export default class Tear extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        // Custom properties
        this.maxSpeed = 10;
        this.setGravityY(0);
    }

    spawn(x, y, dir) {
        this.setPosition(x, y);


        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.setVelocity(dir.x * this.maxSpeed, dir.y * this.maxSpeed);
    }
}