import State from "../State.js"

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
        if (inputs.attack.isDown) {
            this.stateMachine.transition('attack');
        }
        if(player.body.velocity.x === 0) this.stateMachine.transition('idle');
    }
    exit(player) {
        player.setVelocityX(0);
    }
}