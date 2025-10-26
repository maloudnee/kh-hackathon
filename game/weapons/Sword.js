export default class Sword {
    constructor(scene) {
        this.scene = scene;
        this.damage = 10;
        this.cooldown = 500;
    }

    attack(player) {
        // Create an invisible hitbox for the attack
        const hitbox = this.scene.physics.add.sprite(player.x + 20, player.y, null);
        hitbox.body.setSize(30, 40);
        hitbox.setVisible(false);
        player.play()
        // Detect collision with enemies
        this.scene.physics.add.overlap(hitbox, this.scene.enemies, (hb, enemy) => {
            enemy.takeDamage(this.damage);
        });

        // Remove hitbox after short time
        this.scene.time.delayedCall(100, () => hitbox.destroy());
    }
}
