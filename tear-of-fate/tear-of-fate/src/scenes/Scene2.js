import StateMachine from '../StateMachine.js';
import IdleState from '../States/IdleState.js';
import RunState from '../States/RunState.js';
import JumpState from '../States/JumpState.js';
import AttackState from '../States/AttackState.js';
import Enemy from '../Enemy.js';
import Tear from '../weapons/Tear.js';
import Player from '../Player.js';

export default class Scene2 extends Phaser.Scene {
    constructor() {
        super("scene2");
    }

    preload() {
        this.load.image('sadbackground', 'assets/sadsadbackground.png');
        this.load.spritesheet('idle', 'assets/StickmanPack/Idle/Thin.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('ground', 'assets/ground_2.png');
        this.load.spritesheet('run', "assets/StickmanPack/Run/Run.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("jump", "assets/StickmanPack/Jump/Jump.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("player_attack", "assets/StickmanPack/Punch/Punch.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("devilIdle", 'assets/Flying Demon 2D Pixel Art/Sprites/with_outline/IDLE.png', { frameWidth: 81, frameHeight: 71 });
        this.load.image("tear", "assets/tear-png-33469.png");
        this.load.image('heart', 'assets/heart.png');
    }

    create() {
        this.physics.world.gravity.y = 500;

        // --- ANIMATIONS ---
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('run', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 9 }),
            frameRate: 20,
            repeat: 0
        });

        this.anims.create({
            key: "devil_idle",
            frames: this.anims.generateFrameNumbers("devilIdle", { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // --- GROUPS ---
        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 50,
            runChildUpdate: true
        });

        this.playerTears = this.physics.add.group({
            classType: Tear,
            runChildUpdate: true
        });

        this.goldenTears = this.physics.add.group({
            classType: Phaser.Physics.Arcade.Image,
            runChildUpdate: false
        });

        // --- BACKGROUND + GROUND ---
        const { width, height } = this.sys.game.canvas;
        this.sadbackground = this.add.tileSprite(0, 0, width, height, 'sadbackground').setOrigin(0, 0);
        this.ground = this.add.tileSprite(0, height - 32, width, 32, 'ground').setOrigin(0, 0);
        this.physics.add.existing(this.ground, true);

        // --- PLAYER ---
        this.player = new Player(this, 200, 200, this.playerTears);
        this.player.setCollideWorldBounds(true);
        this.player.setSize(16, 64);

        // 🩷 HEARTS / LIVES UI
        this.maxLives = 3;
        this.lives = this.maxLives;
        this.hearts = this.add.group();
        this.heartSpacing = 40;

        this.updateHeartsUI = () => {
            this.hearts.clear(true, true);
            for (let i = 0; i < this.lives; i++) {
                const heart = this.add.image(
                    this.sys.game.config.width - (i * this.heartSpacing) - 30,
                    30,
                    'heart'
                )
                    .setScale(0.05)
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0);
                this.hearts.add(heart);
            }
        };
        this.updateHeartsUI();

        // 💛 HAPPINESS BAR (aligned under hearts)
        this.happiness = 0;
        this.maxHappiness = 100;

        // background + fill rectangles
        this.happinessBarBg = this.add.rectangle(
            this.sys.game.config.width - 90, 50, 100, 10, 0x555555
        ).setOrigin(0.5, 0).setScrollFactor(0);

        this.happinessBar = this.add.rectangle(
            this.sys.game.config.width - 90, 50, 100, 10, 0xffd700
        ).setOrigin(0.5, 0).setScrollFactor(0);

        this.updateHappinessBar = () => {
            const width = (this.happiness / this.maxHappiness) * 100;
            this.happinessBar.width = width;
        };
        this.updateHappinessBar();

        // --- CONTROLS + PHYSICS ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.goldenTears, this.ground);

        // --- STATE MACHINE ---
        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            run: new RunState(),
            jump: new JumpState(),
            attack: new AttackState(),
        }, this.player);

        // --- ENEMIES ---
        this.spawnEnemy(250, 100);
        this.spawnEnemy(450, 100);
        this.spawnEnemy(650, 100);

        // --- OVERLAPS ---
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.playerTears, this.enemies, this.onTearHit, null, this);
        this.physics.add.overlap(this.player, this.goldenTears, this.collectGoldenTear, null, this);
    }

    spawnEnemy(x, y) {
        const enemy = this.enemies.get(x, y, 'devilIdle');
        if (!enemy) return;
        enemy.spawn(x, y, 'patrol');
        enemy.play('devil_idle');
        enemy.setCollideWorldBounds(true);
        enemy.body.setBounce(0.2);
        enemy.body.setGravityY(300);
    }

    onPlayerHit(player, enemy) {
        if (player.invincible) return;

        this.lives -= 1;
        this.updateHeartsUI();

        if (this.lives <= 0) {
            console.log("💀 Player died! Resetting hearts...");
            this.lives = this.maxLives;
            this.updateHeartsUI();
        }

        this.respawnPlayer();
    }

    respawnPlayer() {
        this.player.setPosition(200, 200);
        this.player.setVelocity(0, 0);
        this.player.setAlpha(0.3);
        this.player.invincible = true;

        this.time.delayedCall(1500, () => {
            this.player.setAlpha(1);
            this.player.invincible = false;
        });
    }

    // 🟡 Enemy hit
    onTearHit(tear, enemy) {
        tear.destroy();

        // Flash gold briefly
        enemy.setTint(0xffd700);
        this.time.delayedCall(150, () => enemy.clearTint());

        // When enemy dies
        enemy.takeDamage(1);
        if (enemy.health <= 0) {
            this.dropGoldenTears(enemy.x, enemy.y);
        }
    }

    // 🪙 Drop 3 golden tears
    dropGoldenTears(x, y) {
        for (let i = 0; i < 3; i++) {
            const tear = this.goldenTears.create(x, y - 20, 'tear').setScale(0.04);
            tear.setTint(0xffd700);
            tear.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-100, -200));
            tear.setBounce(0.6);
            tear.setCollideWorldBounds(true);
        }
    }

    // 💛 Collecting golden tears increases happiness
    collectGoldenTear(player, tear) {
        tear.destroy();
        this.happiness = Math.min(this.maxHappiness, this.happiness + 10);
        this.updateHappinessBar();
    }

    update(time, delta) {
        this.sadbackground.tilePositionX += 1;

        const inputs = {
            left: this.cursors.left,
            right: this.cursors.right,
            space: this.cursors.space,
            attack: this.attackKey,
        };

        this.stateMachine.step(delta, inputs);
    }
}
