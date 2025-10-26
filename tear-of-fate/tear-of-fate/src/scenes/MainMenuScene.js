import Phaser from "phaser";
export default class MainMenu extends Phaser.Scene {
    constructor() {
        super("mainmenu");
    }

    preload() {
        this.load.image('background', 'assets/joy-background.png');
        this.load.image('playbutton', 'assets/playbutton.png');
    }

    player;

    create() {
        // Background
        const { width, height } = this.sys.game.canvas;
        this.background = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0);

        // Game Title 
        this.add.text(width / 2, height / 2, "Tear of Fate", {
            font: "bold 64px Times New Roman",
            color: "#172d44",
            align: "center"
        }).setOrigin(0.5);

        // Play Button
        const playButton = this.add.sprite(width / 2, height / 2 + 50, 'playbutton')
            .setInteractive()
            .setScale(0.1);

        playButton.on('pointerdown', () => {
            this.scene.start('scene1'); 
        });

        playButton.on('pointerover', () => playButton.setTint(0x44ff44));
        playButton.on('pointerout', () => playButton.clearTint());

    }
    update() {
        this.background.tilePositionX += 1;
    }
}