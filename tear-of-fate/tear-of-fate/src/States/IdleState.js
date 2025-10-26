import State from "../State.js"

export default class IdleState extends State {
    enter(player) {
        player.setVelocity(0, player.body.velocity.y);
        player.anims.play('idle', true);
    }

    exit() {

    }


    update(player, dt, inputs) {

        if(inputs.left.isDown || inputs.right.isDown) {
            this.stateMachine.transition('run');
        } else if (Phaser.Input.Keyboard.JustDown(inputs.space) && player.body.blocked.down) {
            this.stateMachine.transition("jump");
        } else if (Phaser.Input.Keyboard.JustDown(inputs.attack)) {
            this.stateMachine.transition("attack");
        }
    }
}