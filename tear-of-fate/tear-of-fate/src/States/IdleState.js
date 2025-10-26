import State from "../State.js"
import Sword from "../../../../game/weapons/Sword.js";
import Tear from "../../../../game/weapons/Tear.js";
import HappyHands from "../../../../game/weapons/HappyHands.js";

export default class IdleState extends State {
    enter(player) {
        player.setVelocity(0, player.body.velocity.y);
        player.anims.play('idle', true);
    }

    exit() {

    }


    update(player, dt, inputs) {

        if (Phaser.Input.Keyboard.JustDown(inputs.space) && player.body.blocked.down) {
            this.stateMachine.transition("jump");
        } else if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof Sword) {
            this.stateMachine.transition("sword");
        }else if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof Tear) {
            this.stateMachine.transition("tear");
        }
        else if (Phaser.Input.Keyboard.JustDown(inputs.attack) && player.currentWeapon instanceof HappyHands) {
            this.stateMachine.transition("happyHands");
        }  else if(inputs.left.isDown || inputs.right.isDown) {
            this.stateMachine.transition('run');
        }
    }
}