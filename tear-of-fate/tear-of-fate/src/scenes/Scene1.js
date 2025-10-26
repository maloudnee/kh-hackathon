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
        this.load.spritesheet('idle', 'assets/playersword.png', { frameWidth: 128, frameHeight: 128 });
        this.load.image('ground', 'assets/platform.png');
        this.load.spritesheet('run', "assets/playersword.png", { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet("jump", "assets/playerjumping.png", { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet("player_attack", "assets/StickmanPack/Punch/Punch.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("devilIdle", 'assets/Flying Demon 2D Pixel Art/Sprites/with_outline/IDLE.png', {frameWidth: 81, frameHeight: 71});
        this.load.image("tear", "assets/tear-png-33469.png");
        this.load.image("player_sword", 'assets/playersword.png');
        this.load.image("vortex", "assets/vortex.png")
        
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
            frames: this.anims.generateFrameNumbers('idle', { start: 1, end: 2 }),
            frameRate: 2,
            repeat: -1
        });

        this.player = new Player(this, 200, 200, this.playerTears, 1);
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
            key: 'attack',
            frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 9 }),
            frameRate: 20,
            repeat: 0
        });
        this.anims.create({

        });

        this.anims.create({
            key: "devil_idle",
            frames: this.anims.generateFrameNumbers("devilIdle", {start: 0, end: 3}),
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
        this.spawnEnemy(200, 200, 'patrol');
        this.spawnEnemy(400, 120, 'chase');
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

            this.cameras.main.zoomTo(1.5, 1500, 'Sine.easeInOut');



    }

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
    }
}