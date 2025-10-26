import State from "../State.js"

export default class HappyHandsState extends State {
    locked = false;
    enter(player) {
        this.locked = true;  // lock during the attack
        player.body.setVelocityX(0);
        //player.anims.play('happy_hands', true);
        player.shootHappyHands(this);

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

    }
}