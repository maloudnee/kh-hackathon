export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        // Background
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000)
            .setOrigin(0, 0);

        // Game Over text
        this.add.text(this.scale.width/2, this.scale.height/2, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5);

        // Restart instructions
        this.add.text(this.scale.width/2, this.scale.height/2 + 100, 'Press SPACE to restart', {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Restart on key press
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('scene1'); // restart main game
        });
    }
}
