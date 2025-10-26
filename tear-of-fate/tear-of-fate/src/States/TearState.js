import State from "../State.js"

export default class TearState extends State {
    enter(player) {
        this.locked = true;  // lock during the attack
        player.body.setVelocityX(0);
        player.anims.play('attack', true);
        player.fireProjectile();

        // Unlock when the attack animation ends
        player.once('animationcomplete', () => {
            this.locked = false;
            this.stateMachine.transition('idle');
        });
    }

    update(player, dt, inputs) {

    }

    exit(player) {
        this.locked = false;
    }
}