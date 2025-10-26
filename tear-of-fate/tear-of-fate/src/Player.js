import Phaser from "phaser";
import StateMachine from "./StateMachine.js";
import IdleState from "./States/IdleState.js";
import RunState from "./States/RunState.js";
import JumpState from "./States/JumpState.js";
import HappyHands from "./weapons/HappyHands.js";
import TearState from "./States/TearState.js";
import HappyHandsState from "./States/HappyHandsState.js";
import SwordState from "./States/SwordState.js";
import Tear from "./weapons/Tear.js";
import Sword from "./weapons/Sword.js";


export default class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, tears, z) {
        super(scene, x, y, 'player');
        this.level = z

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
        if(this.level === 2) {
            this.currentWeapon = new Tear(this.scene);
        }

        this.unlockedHappy = false;

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
        const handOffsetX = 10;
        const handOffsetY = 20;
        const laserLength = 200;
        const startX = this.x + (this.flipX ? -handOffsetX : handOffsetX);
        const startY = this.y + handOffsetY;
        const endX = startX + (this.flipX ? -laserLength : laserLength);
        const endY = startY;

        // Draw the visible laser
        let dx = endX - startX;
        let dy = endY - startY;
        let length = Math.sqrt(dx * dx + dy * dy);
        let angle = Math.atan2(dy, dx);

        let laser = this.scene.add.graphics();
        laser.fillGradientStyle(0xfff3b0, 0xfff3b0, 0xffcc00, 0xffcc00, 1);
        laser.fillRect(0, -2, length, 4); // width 4px, length along X
        laser.setPosition(startX, startY);
        laser.setRotation(angle);


        // Check overlap with all enemies
        this.scene.enemies.getChildren().forEach(enemy => {
            const bounds = enemy.getBounds(); // Phaser.Geom.Rectangle
            const line = new Phaser.Geom.Line(startX, startY, endX, endY);
            if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
                enemy.takeDamage(2); // your damage logic
            }
        });

        // Remove the laser after 0.1s
        this.scene.time.delayedCall(100, () => {
            laser.destroy();
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
        this.stateMachine.step(delta, inputs);

        let topemotion = window.currentEmotion;
        if(this.level === 1) {
            if(topemotion === "happy") {
                this.currentWeapon = new HappyHands(this.scene);
            } else if(topemotion === "angry") {
                this.currentWeapon = new Sword(this.scene);
            }
        }
        if(this.level === 2) {
            if(topemotion === "happy" && this.unlockedHappy) {
                this.currentWeapon = new HappyHands(this.scene);
            }
        }
    }

}
