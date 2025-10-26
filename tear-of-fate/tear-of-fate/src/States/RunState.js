import State from "../State.js"
import Sword from "../../../../game/weapons/Sword.js";
import Tear from "../../../../game/weapons/Tear.js";
import HappyHands from "../../../../game/weapons/HappyHands.js";

export default class RunState extends State {
    enter(player) {
        player.anims.play('run', true);
    }
    MAX_VEL_X = 160;
    ACCEL_ON_MOVE = 500;
    DRAG_VAL = 600;
    update(player, dt, inputs) {
        if (inputs.left.isDown && Math.abs(player.body.velocity.x) <= this.MAX_VEL_X) {
            player.setAccelerationX(-this.ACCEL_ON_MOVE);
            player.flipX = true;
        } else if (inputs.right.isDown && Math.abs(player.body.velocity.x) <= this.MAX_VEL_X){
            player.setAccelerationX(this.ACCEL_ON_MOVE);
            player.flipX = false;
        } else {
            player.setAccelerationX(0);
            player.setDragX(this.DRAG_VAL);
        }

        if (Phaser.Input.Keyboard.JustDown(inputs.space) && player.body.blocked.down) {
            this.stateMachine.transition('jump');
        }
        if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof Sword) {
            this.stateMachine.transition("sword");
        }else if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof Tear) {
            this.stateMachine.transition("tear");
        }
        else if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof HappyHands) {
            this.stateMachine.transition("happyHands");
        }
        if(player.body.velocity.x === 0) this.stateMachine.transition('idle');
    }
    exit(player) {
        player.setVelocityX(0);
    }
}