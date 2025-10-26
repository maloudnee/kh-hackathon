import StateMachine from '../StateMachine.js';
import IdleState from '../States/IdleState.js';
import RunState from '../States/RunState.js';
import JumpState from '../States/JumpState.js';
import AttackState from '../States/AttackState.js';
import Enemy from '../Enemy.js';
import Tear from '../weapons/Tear.js';
import Player from '../Player.js';
import { WebSocketService } from '../WebsocketService.js';

export default class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene1");
    }

    preload() {
        this.load.image('joybackground2', 'assets/joybackground2.png');
        this.load.spritesheet('idle', 'assets/player.png', { frameWidth: 128, frameHeight: 128 });
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('run', "assets/playersword.png", { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet("jump", "assets/playerjumping.png", { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet("player_attack", "assets/StickmanPack/Punch/Punch.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("devilIdle", 'assets/Flying Demon 2D Pixel Art/Sprites/with_outline/IDLE.png', {frameWidth: 81, frameHeight: 71});
        this.load.image("tear", "assets/tear-png-33469.png");
        this.load.spritesheet("player_sword", 'assets/playersword.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet("vortex", "assets/vortex.png", { frameWidth: 256, frameHeight: 256 })

        // --- FIX: Add the missing 'heart' image asset load for the HUD ---
        this.load.image('heart', 'assets/heart.png'); // 🚨 CHECK THIS PATH 🚨
    }

    player;

    create() {
        this.background = this.add.tileSprite(0, 0, this.scale.width, this.scale.height, 'joybackground2')
        .setOrigin(0, 0)
        .setDisplaySize(this.scale.width, this.scale.height)
        .setScrollFactor(0);

        this.cameras.main.setZoom();
        this.cameras.main.centerOnY(this.scale.height / 2);

        this.playerTears = this.physics.add.group({
            classType: Tear,
            runChildUpdate: true
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 6, end: 7 }),
            frameRate: 2,
            repeat: -1
        });

        this.player = new Player(this, 16, this.scale.height - 16 - 128, this.playerTears, 1);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(32, 128);
        this.player.health = 3;
        this.player.health = this.player.health.maxHealth;

        //this.physics.add.collider(this.player, ground);
        this.enemies = this.physics.add.group();
        this.physics.world.gravity.y = 500;

        // Idle animation

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('jump', { start: 3, end: 8 }),
            frameRate: 10,
            repeat: 0
        });
        // Run animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('run', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        // Attack animation
        this.anims.create({
            key: 'player_sword',
            frames: this.anims.generateFrameNumbers('player_sword', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: "happy_hands",
            frames: this.anims.generateFrameNumbers("jump", {start: 0, end: 0}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "devil_idle",
            frames: this.anims.generateFrameNumbers("devilIdle", {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "vortex",
            frames: this.anims.generateFrameNumbers("vortex", {start: 0, end: 5}),
            frameRate: 10,
            repeat: -1
        });
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 50, // max pooled enemies
            runChildUpdate: true // so each Enemy.preUpdate runs automatically
        });

        // --- PLAYER HEALTH BAR ---
        this.playerHealthBar = this.add.graphics();
        this.updatePlayerHealthBar();
        // --- PLAYER HUD ---
        this.lives = 3;
        this.hearts = [];

        const heartSize = 48; // big hearts
        const padding = 10;   // padding from the right edge
        const spacing = 8;    // distance between hearts

        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.image(
                this.scale.width - padding - i * spacing - heartSize * i, // subtract only spacing + previous heart sizes
                padding + heartSize / 2,
                'heart' // This key is now loaded in preload
            )
            .setScrollFactor(0)
            .setDisplaySize(heartSize, heartSize);
            this.hearts.push(heart);
        }


        // Add score below the hearts
        this.score = 0;
        this.scoreText = this.add.text(
            this.scale.width - padding,               // right-aligned x
            padding + heartSize + 5,                  // y below hearts
            'Score: 0',
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        )
        .setScrollFactor(0)
        .setOrigin(1, 0); // align text to the right

        //this.player.setOffset(24, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(200, 280, 'ground').refreshBody();
        this.platforms.create( 416/2 - 416, this.scale.height - 16, 'ground').refreshBody();
        this.platforms.create( 416/2, this.scale.height - 16, 'ground').refreshBody();
        this.platforms.create( 416/2 +416, this.scale.height - 16, 'ground').refreshBody();
        this.platforms.create( 416/2 + 416*2, this.scale.height - 16, 'ground').refreshBody();
        this.physics.add.collider(this.player, this.platforms);


        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // Enemy setup will only work if the Enemy class is correctly using the 'devilIdle' texture key
        // this.spawnEnemy(200, 200, 'patrol');
        // this.spawnEnemy(400, 120, 'chase');
        this.physics.add.collider(this.enemies, this.platforms); // if you have platforms group

        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.playerTears, this.enemies, this.onTearHit, null, this);

        // Set up websocket
        WebSocketService.registerScene(this);

        // Timer that repeats to send data 
        this.time.addEvent({
            delay: 50,
            callback: this.sendPlayerState,
            callbackScope: this,
            loop: true
        });

        this.cameras.main.startFollow(this.player);

        this.cameras.main.setScroll(16, this.scale.height-128-16);
        this.cameras.main.setZoom(1.222);

        this.cameras.main.fadeIn(1000, 0, 0, 0);


        // Story text style
        const textStyle = {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#ffffcc',
            align: 'center',
            wordWrap: { width: this.scale.width * 0.8 }
        };

        // Empty text object (we’ll fill it letter by letter)
        const storyText = this.add.text(
            0,
            this.scale.height / 2,
            '',
            textStyle
        ).setOrigin(0.5);

        const lines = [
            "The man always lived a good life.",
            "Full of happiness and courage.",
            "Until the demons showed up.",
            "Use F to attack",
            "Look happy or angry to switch weapons"
        ];

        // Reveal text line by line
        let lineIndex = 0;
        const showNextLine = () => {
            if (lineIndex >= lines.length) {
                // Fade out and start next scene
                this.time.delayedCall(2000, () => {

                });
                return;
            }

            this.revealText(lines[lineIndex], storyText, () => {
                lineIndex++;
                this.time.delayedCall(1000, showNextLine);
            });
        };

        showNextLine();

    }


    // helper: typewriter effect
    revealText(fullText, textObject, onComplete) {
        textObject.setText('');
        let i = 0;
        this.time.addEvent({
            delay: 50,
            repeat: fullText.length - 1,
            callback: () => {
                textObject.setText(fullText.substring(0, i + 1));
                i++;
                if (i === fullText.length && onComplete) {
                    onComplete();
                }
            }
        });




        this.time.delayedCall(8000, () => {
            this.spawnEnemy(400, this.scale.height - 128-16, "patrol");
            this.spawnEnemy(500, this.scale.height - 228-16, "patrol");
            this.spawnEnemy(600, this.scale.height - 128-16, "chase");
            this.spawnEnemy(700, this.scale.height - 228-16, "chase");
        });

        this.time.delayedCall(15000, () => {
            this.vortex = this.add.sprite(2100, this.scale.height-32, "vortex");
            this.vortex.play("vortex", true);
        });

    }//

    sendPlayerState() {
        const gameData = {
            player_stats: {
                health: this.player.health,
                lives: this.lives,
                score: this.score,
                position: { x: this.player.x, y: this.player.y },
            },
            level: 1,
            timestamp: Date.now()
        };
        WebSocketService.sendGameData(gameData);



    }

    handleAgentResponse(data) {
        if(data.enemy_actions) {
            this.executeEnemyActions(data.enemy_actions);
        }
    }


    spawnEnemy(x, y, ai = 'patrol') {
        const enemy = this.enemies.get(x, y, 'devilIdle');
        if (!enemy) return; // pool exhausted
        enemy.spawn(x, y, ai);
        enemy.play('devil_idle');
    }


    onPlayerHit(player, enemy) {
        player.takeDamage(1);
        enemy.setRecentlyHitPlayer();
    }
    onTearHit(tear, enemy) {
        tear.destroy()

        enemy.takeDamage(1);
        console.log(enemy.health);
    }

    updatePlayerHealthBar() {
        if (!this.player || !this.playerHealthBar) return;
    
        const x = this.player.x;
        const y = this.player.y - 50;
        const width = 40;
        const height = 6;
    
        this.playerHealthBar.clear();
    
        // RED background
        this.playerHealthBar.fillStyle(0xff0000, 1);
        this.playerHealthBar.fillRect(x - width / 2, y, width, height);
    
        // GREEN foreground
        this.playerHealthBar.fillStyle(0x00ff00, 1);
        const health = Phaser.Math.Clamp(this.player.health, 0, 3); // 3 = max health
        const healthWidth = width * (health / 3); // full green at start
        this.playerHealthBar.fillRect(x - width / 2, y, healthWidth, height);
    }

    update(time, delta) {
        this.background.tilePositionX += 0.5; 

        const inputs = {
            left: this.cursors.left,
            right: this.cursors.right,
            space: this.cursors.space,
            attack: this.attackKey,
        };
        this.player.update(delta, inputs);

        this.updatePlayerHealthBar();
        if(this.vortex) {
            let dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.vortex.x, this.vortex.y
            );
            if(dist < 50) {
                // Shake the camera first
                this.cameras.main.shake(300, 0.02, true);

                // Listen for when the shake completes
                this.cameras.main.once('camerashakecomplete', () => {
                    // Now fade out
                    this.cameras.main.fadeOut(1000, 0, 0, 0);

                    // When fade is done, start Scene2
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('scene2');
                    });
                });
            }
        }
    }
}