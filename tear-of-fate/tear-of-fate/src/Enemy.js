import Phaser from "phaser";
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setCollideWorldBounds(true);

        // Custom properties
        this.maxSpeed = 80;
        this.health = 3;
        this.ai = 'patrol'; // 'patrol' | 'chase' | 'wander'
        this.patrolRange = 100;
        this.patrolStartX = x;
        this.direction = 1;
        this.active = false;
        this.recentlyHitPlayer = false;
        this.timeHit = 0;
        this.setGravityY(20);
    }

    spawn(x, y, ai = 'patrol') {
        this.setPosition(x, y);
        this.ai = ai;
        this.health = 3;
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;

        // reset velocity
        this.setVelocity(0, 0);

    }

    setRecentlyHitPlayer() {
        this.recentlyHitPlayer = true;
    }

    takeDamage(amount = 1) {
        this.health -= amount;
        if (this.health <= 0) this.die();
        else {
            // knockback or flash
            this.scene.tweens.add({
                targets: this,
                alpha: 0.3,
                duration: 80,
                yoyo: true,
                repeat: 0
            });
        }
    }

    die() {
        this.body.enable = false;
        this.setActive(false);
        this.setVisible(false);
        // spawn particles, drop loot, play sound, etc.
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta); // keep animations working


        // very simple AI
        if (this.ai === 'patrol') {
            // move left/right around patrolStartX
            if (this.x > this.patrolStartX + this.patrolRange) this.direction = -1;
            if (this.x < this.patrolStartX - this.patrolRange) this.direction = 1;
            this.setVelocityX(this.direction * this.maxSpeed);
            this.flipX = this.direction < 0;
        } else if (this.ai === 'chase') {
            const player = this.scene.player; // assume scene has a player reference
            if (player) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const angle = Math.atan2(dy, dx);
                this.setVelocity(Math.cos(angle) * this.maxSpeed, Math.sin(angle) * this.maxSpeed);
                this.flipX = this.body.velocity.x < 0;
            }
        } else if (this.ai === 'wander') {
            // simple random wander using occasional velocity changes
            if (!this._nextWander || time > this._nextWander) {
                const vx = Phaser.Math.Between(-this.maxSpeed, this.maxSpeed);
                const vy = Phaser.Math.Between(-this.maxSpeed/2, this.maxSpeed/2);
                this.setVelocity(vx, vy);
                this._nextWander = time + Phaser.Math.Between(500, 2000);
            }
        }
    }
}