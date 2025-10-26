export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, tears) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setGravityY(250);
        this.tears = tears
    }
    health = 3;

    fireProjectile() {
        const projectile = this.tears.create(this.x, this.y, 'tear');
        projectile.setDisplaySize(16, 16);
        projectile.setVelocityX(this.flipX ? -300 : 300);
        projectile.body.allowGravity = false;
        this.setAccelerationX(0);
    }

    takeDamage(num) {
        this.health -= num;
    }
}
