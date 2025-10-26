import State from "../State.js"
import Tear from "../weapons/Tear.js";
import Sword from "../weapons/Sword.js";
import HappyHands from "../weapons/HappyHands.js";

export default class AttackState extends State{
    enter(player) {
        if(player.currentWeapon instanceof Tear) {
            player.actionFSM
        } else if(player.currentWeapon instanceof Sword) {

        } else if(player.currentWeapon instanceof HappyHands) {

        }

    }

    update(player, dt, inputs) {
        // ignore movement input while attacking
    }

    exit(player) {

    }
}
