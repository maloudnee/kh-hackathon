import Phaser from "phaser";
import StateMachine from "./StateMachine.js";
import IdleState from "./States/IdleState.js";
import RunState from "./States/RunState.js";
import JumpState from "./States/JumpState.js";
import HappyHands from "./weapons/HappyHands.js";
import TearState from "./States/TearState.js";
import HappyHandsState from "./States/HappyHandsState.js";
import SwordState from "./States/SwordState.js";


export default class Player extends Phaser.Physics.Arcade.Sprite {
    fire = 0;
    constructor(scene, x, y, tears) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setGravityY(250);
        this.tears = tears;
        this.health = 3;
        this.graphics = scene.add.graphics();
        this.scene = scene;


        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            run: new RunState(),
            jump: new JumpState(),
            happyHands: new HappyHandsState(),
            tear: new TearState(),
            sword: new SwordState()
        }, this);

        this.currentWeapon = new HappyHands(this.scene);

    }
    setCurrentWeapon(weapon) {
        this.currentWeapon = weapon;
    }


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

    shootHappyHands(state) {
        const handOffsetX = 20;
        const handOffsetY = 10;
        const laserLength = 300;
        const startX = this.x + handOffsetX;
        const startY = this.y + handOffsetY;
        const endX = startX + (this.flipX ? -laserLength : laserLength);
        const endY = startY;

        // Draw the visible laser
        let laserGraphics = this.scene.add.graphics();
        laserGraphics.lineStyle(4, 0xFFD700, 1);
        laserGraphics.beginPath();
        laserGraphics.moveTo(startX, startY);
        laserGraphics.lineTo(endX, endY);
        laserGraphics.strokePath();

        // Check overlap with all enemies
        this.scene.enemies.getChildren().forEach(enemy => {
            const bounds = enemy.getBounds(); // Phaser.Geom.Rectangle
            const line = new Phaser.Geom.Line(startX, startY, endX, endY);
            if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
                enemy.takeDamage(10); // your damage logic
            }
        });

        // Remove the laser after 0.1s
        this.scene.time.delayedCall(100, () => {
            laserGraphics.destroy();
        });
        state.locked = false;
    }




    swingSword() {
        const hitbox = this.scene.physics.add.sprite(this.x + 20, this.y, null);
        hitbox.body.setSize(30, 40);
        hitbox.setVisible(false);

        // Detect collision with enemies
        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {
            enemy.takeDamage(this.damage);
        });

        // Remove hitbox after short time
        this.scene.time.delayedCall(100, () => hitbox.destroy());
    }

    update(delta, inputs) {
        this.stateMachine.step(delta, inputs)
    }

}
