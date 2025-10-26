import State from "../State.js"

export default class JumpState extends State {

    JUMP_VELOCITY = -300;
    enter(player) {
        player.setVelocityY(this.JUMP_VELOCITY)
        player.anims.play('jump', true);
    }

    update(player, dt, inputs) {
        if(player.body.blocked.down) {
            this.stateMachine.transition('idle');
        }
    }

    exit() {

    }
}