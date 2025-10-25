import Scene1 from "./scenes/Scene1.js";


let player;
const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 300,
    backgroundColor: '#222',
    scene: Scene1,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

new Phaser.Game(config);


