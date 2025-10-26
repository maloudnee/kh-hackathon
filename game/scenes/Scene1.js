import StateMachine from "../StateMachine.js";
import IdleState from "../States/IdleState.js";
import RunState from "../States/RunState.js";
import JumpState from "../States/JumpState.js";
import AttackState from "../States/AttackState.js";
import Enemy from "../Enemy.js";
import Tear from "../weapons/Tear.js";
import Player from "../Player.js"

export default class Scene1 extends Phaser.Scene {
    constructor() {
        super("scene1");
    }




    preload() {
        this.load.image('background', 'assets/background.png');
        this.load.spritesheet('idle', 'assets/StickmanPack/Idle/Thin.png', { frameWidth: 64, frameHeight: 64 });
        this.load.image('ground', 'assets/ground.png');
        this.load.spritesheet('run', "assets/StickmanPack/Run/Run.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("jump", "assets/StickmanPack/Jump/Jump.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("player_attack", "assets/StickmanPack/Punch/Punch.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("devilIdle", 'assets/Flying Demon 2D Pixel Art/Sprites/with_outline/IDLE.png', {frameWidth: 81, frameHeight: 71});
        this.load.image("tear", "assets/tear-png-33469.png")
    }

    player;

    create() {
        this.physics.world.gravity.y = 500;
        // Idle animation
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('idle', { start: 0, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        // Run animation
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('run', { start: 0, end: 5 }),
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

        this.playerTears = this.physics.add.group({
                classType: Tear,
            runChildUpdate: true
        });


        this.add.image(200, 150, "background");
        this.player = new Player(this, 200, 200, this.playerTears);
        this.player.setCollideWorldBounds(true);

        this.player.setSize(16, 64);
        //this.player.setOffset(24, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(200, 280, 'ground');
        this.physics.add.collider(this.player, this.platforms);

        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);





        this.spawnEnemy(200, 200, 'patrol');
        this.spawnEnemy(400, 120, 'chase');
        this.physics.add.collider(this.enemies, this.platforms); // if you have platforms group

        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHit, null, this);
        this.physics.add.overlap(this.playerTears, this.enemies, this.onTearHit, null, this);
    }


    spawnEnemy(x, y, ai = 'patrol') {
        const enemy = this.enemies.get(x, y, 'enemy');
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

    update(time, delta) {
        const inputs = {
            left: this.cursors.left,
            right: this.cursors.right,
            space: this.cursors.space,
            attack: this.attackKey,
        };
        this.player.update(delta, inputs);


    }
}