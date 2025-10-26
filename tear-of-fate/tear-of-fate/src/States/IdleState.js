import State from "../State.js"
import Sword from "../weapons/Sword.js";
import Tear from "../weapons/Tear.js";
import HappyHands from "../weapons/HappyHands.js";

export default class IdleState extends State {
    enter(player) {
        player.setVelocity(0, player.body.velocity.y);
        player.anims.play('idle', true);
    }

    exit() {

    }


    update(player, dt, inputs) {

        console.log(this.stateMachine.possibleStates);
        if (Phaser.Input.Keyboard.JustDown(inputs.space) && player.body.blocked.down) {
            this.stateMachine.transition("jump");
        } else if (Phaser.Input.Keyboard.JustDown(inputs.attack)) {
            if (player.currentWeapon instanceof Sword) {
                this.stateMachine.transition("sword");
            } else if (player.currentWeapon instanceof Tear) {
                this.stateMachine.transition("tear");
            } else if (player.currentWeapon instanceof HappyHands) {
                this.stateMachine.transition("happyHands");
            }
        } else if (inputs.left.isDown || inputs.right.isDown) {
            this.stateMachine.transition('run');
        } else {
            this.stateMachine.transition('idle');
        }
    }
}