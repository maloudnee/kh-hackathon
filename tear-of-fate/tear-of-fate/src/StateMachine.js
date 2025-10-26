// StateMachine.js
export default class StateMachine {
    constructor(initialState, possibleStates, context) {
        this.initialState = initialState;
        this.possibleStates = possibleStates; // { idle: new IdleState(), attack: new AttackState() }
        this.context = context;               // usually the player or enemy sprite
        this.state = null;


        // Assign state machine reference to each state
        for (const state of Object.values(this.possibleStates)) {
            state.stateMachine = this;
        }

        this.transition(initialState);
    }

    transition(newState) {
        if (this.state && this.state.locked) {
            return; // do nothing until unlocked
        }
        if (this.state) {
            this.state.exit(this.context);
        }

        this.state = this.possibleStates[newState];
        this.state.enter(this.context);
    }

    step(dt, inputs) {
        this.state.update(this.context, dt, inputs);
    }
}
