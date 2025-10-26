import State from "../State.js"

export default class SwordState extends State {
    locked = false
    enter(player) {
        this.locked = false;  // lock during the attack
        player.body.setVelocityX(0);
        //player.anims.play('sword_attack', true);
        player.swingSword();

        // Unlock when the attack animation ends
        player.once('animationcomplete', () => {
            this.locked = false;
            this.stateMachine.transition('idle');

        });
        this.stateMachine.transition('idle');
    }
    update() {

    }
    exit() {
        this.locked = false;
    }
}