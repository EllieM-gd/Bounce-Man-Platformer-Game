class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATIONSPEED = 400;
        this.DRAG = 200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -600;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;
        this.bounceRate = 1;
        this.curentLives = 3;
        this.playOnce = true; //for victory audio

        this.coinsCollected = 0;
        this.gameOver = false;
        this.victory = false;

        this.starParticles = false;
        this.starCounter = 0;
        this.starCDRRate= 15;

        this.checkpointParticles = false;
        this.checkpointCounter = 0;
        this.checkpointCDR = 20;

        this.xRespawn = 30;
        this.yRespawn = 350;
    }

    preload(){

        this.jumpsound = this.sound.add("jumpSFX", {volume: 0.5});
        this.deathSound = this.sound.add("deathSFX", {volume: 0.8});
        this.coinSound = this.sound.add("coinSFX");
        this.coinSound.setDetune(500);
        this.coinSound2 = this.coinSound;
        this.checkpointSound = this.sound.add("checkPointSFX", {volume: 0.8,detune: -200});
        this.victorySound = this.sound.add("victorySFX");
    }

    create() {
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 45, 25);
        var tex = this.textures.get('Background-Layer-0').getSourceImage();
        my.Background0 = this.add.tileSprite(
            0,
            this.map.heightInPixels - tex.height,
            this.map.widthInPixels,
            this.map.heightInPixels,
            'Background-Layer-0'
        );
        var tex = this.textures.get('Background-Layer-half').getSourceImage();
        my.Backgroundhalf = this.add.tileSprite(
            0,
            400,
            this.map.widthInPixels,
            tex.height,
            'Background-layer-half'
        );
        my.Backgroundhalf.setScale(this.SCALE);
        my.Background0.setScale(this.SCALE);
        var tex = this.textures.get('Background-Layer-1').getSourceImage();
        my.Background1 = this.add.tileSprite(
            0,
            this.map.heightInPixels - tex.height,
            this.map.widthInPixels,
            tex.height,
            'Background-Layer-1'
        );
        my.Background1.setScale(this.SCALE);
        var tex = this.textures.get('Background-Layer-2').getSourceImage();
        my.Background2 = this.add.tileSprite(
            0,
            this.map.heightInPixels - tex.height,
            this.map.widthInPixels,
            tex.height,
            'Background-Layer-2'
        );
        my.Background2.setScale(this.SCALE);

        // Add a tileset to the map
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.backLayer = this.map.createLayer("Background", this.tileset, 0, 0);
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });

        //Setup groups for objects in Tiled
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });
        this.endFlag = this.map.createFromObjects("Objects", {
            name: "end",
            key: "tilemap_sheet",
            frame: 111
        });
        this.ladder = this.map.createFromObjects("Objects", {
            name: "ladder",
            key: "tilemap_sheet",
            frame: 71,
        });
        this.snow = this.map.createFromObjects("Objects", {
            name: "snow",
            key: "tilemap_sheet",
            frame: 154,
        });
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spikes",
            key: "tilemap_sheet",
            frame: 68,
        });
        this.flag = this.map.createFromObjects("Objects", {
            name: "flag",
            key: "tilemap_sheet",
            frame: 111,
        });
        this.jumpPad = this.map.createFromObjects("Objects", {
            name: "jump",
            key: "tilemap_sheet",
            frame: 107,
        });
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.ladder, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.snow, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.flag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.jumpPad, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endFlag, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.TILE_BIAS = 32;

        //Tutorial Text
        my.text.firstTut = this.add.text(40,375,"Use left & right to move!",{
            color: "#FF69B4",
            strokeThickness: .3,
            stroke: "#808080",
            fontStyle: "Bold",
            fontSize: 36

    });
        my.text.firstTut.setScale(.5);
        my.text.secTut = this.add.text(333,200,"Hold up to jump higher!", {
            fontSize: 36,
            fontStyle: "Bold"
        });
        my.text.secTut.setScale(.45);
        my.text.secTut.setVisible(false);


        my.text.gameOverText = this.add.text(450,440,"Game Over! Press R or / to restart!",{
            color: "#800000",
            strokeThickness: 1,
            stroke: "#808080",
            fontStyle: "Bold",
            fontSize: 80,
            backgroundColor: "#708090"
        }).setScrollFactor(0); 
        my.text.gameOverText.setScale(.3);
        my.text.gameOverText.setVisible(false);

        this.createVictoryText = () => {
        my.text.victorytext = this.add.text(410,340,"You Win!! Coin Count: "+this.coinsCollected+"\nPress R or / to play again!",{
            color: "#00FF7F",
            strokeThickness: 1,
            stroke: "#808080",
            fontStyle: "Bold",
            fontSize: 160,
            backgroundColor: "#40E0D0"
        }).setScrollFactor(0); 
        my.text.victorytext.setScale(.25);
        my.text.victorytext.setVisible(false);
    }
        // Create a Phaser group out of the array
        this.coinGroup = this.add.group(this.coins);
        this.ladderGroup = this.add.group(this.ladder);
        this.snowGroup = this.add.group(this.snow);
        this.spikeGroup = this.add.group(this.spikes);
        this.flagGroup = this.add.group(this.flag);
        this.jumpGroup = this.add.group(this.jumpPad);

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(30, 345, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        //player.body.bounce.y = 0.2;

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);
        //BOUNCE MAN!!!! ONE PIECE REFERENCE XD
        //This is the code that makes the player bounce.
        my.sprite.player.body.bounce.y = this.bounceRate;

        //coin VFX
        my.vfx.coinGrab = this.add.particles(0, 0, "kenny-particles", {
            frame: 'symbol_02.png',
            angle: { min: -30, max: 30 },
            x: {min: -200, max: 200},
            // TODO: Try: add random: true
            scale: {start: 0.1, end: 0.15},
            maxAliveParticles: 40,
            lifespan: 200,
            gravityY: -500,
            alpha: {start: 1, end: 0.0}, 
        });
        my.vfx.coinGrab.stop();

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            my.vfx.coinGrab.startFollow(obj2, obj2.displayWidth/2-7, obj2.displayHeight/2-5, false);
            my.vfx.coinGrab.start();
            this.starCounter = 0;
            this.starParticles = true;
            this.coinsCollected += 1;
            if (!this.coinSound.isPlaying){
            this.coinSound.play();
            }
            else this.coinSound2.play();
            this.updateCoinCount();
            obj2.destroy(); // remove coin on overlap
        });

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        this.rKey = this.input.keyboard.addKey('R');
        this.aKey = this.input.keyboard.addKey('A');
        this.wKey = this.input.keyboard.addKey('W');
        this.dKey = this.input.keyboard.addKey('D');
        this.slashKey = this.input.keyboard.addKey("FORWARD_SLASH");

        // movement vfx
        my.vfx.jumping = this.add.particles(0, 0, "kenny-particles", {
            frame: ['flame_02.png', 'flame_03.png'],
            // TODO: Try: add random: true
            scale: {start: 0.04, end: 0.15},
            maxAliveParticles: 40,
            particleColor: 0xD2691E,
            lifespan: 250,
            gravityY: 100,
            alpha: {start: 1, end: 0.0}, 
        });
        my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2-5, false);
        my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        my.vfx.jumping.stop();  //Hides Particles

        my.vfx.checkPoint = this.add.particles(0,0, "kenny-particles", {
            frame: "circle_02.png",
            scale: {start: 0.1, end: 0.3},
            maxAliveParticles: 10,
            lifespan: 100,
            gravityY: -100,
            alpha: {start: 0.5, end: 1}
        })
        my.vfx.checkPoint.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
        my.vfx.checkPoint.stop();
        
        //Camera Code
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);


        
        this.updateCoinCount = function() {
            if (my.text.coinsCollectedText) {
                my.text.coinsCollectedText.destroy(true);
            }
            my.text.coinsCollectedText = this.add.text(375,240,"Coins: "+this.coinsCollected,{
                color: "gold",
                strokeThickness: .3,
                stroke: "#808080",
                fontStyle: "Bold",
                fontSize: 40
            }).setScrollFactor(0); 
            my.text.coinsCollectedText.setScale(.5);
    }

        this.updateCoinCount();

        this.updateLiveCount = function() {
            if (my.text.liveCountText) {
                my.text.liveCountText.destroy(true);
            }
            my.text.liveCountText = this.add.text(975,240,"Lives: "+this.curentLives,{
                color: "#7CFC00",
                strokeThickness: .3,
                stroke: "#808080",
                fontStyle: "Bold",
                fontSize: 40
            }).setScrollFactor(0); 
            my.text.liveCountText.setScale(.5);
    }

        this.updateLiveCount();


        this.restartGame = () => {
            this.scene.restart();
        }


        this.playerRespawn = () => {
            this.curentLives -= 1;
            this.updateLiveCount();
            this.deathSound.play();
            if (this.curentLives <= 0){
                //reset game.
                this.gameOver = true;
            }
            else {
            my.sprite.player.setVelocityY(0);
            my.sprite.player.setPosition(this.xRespawn,this.yRespawn);
            }

        }
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, () => {this.playerRespawn();});

        this.setCheckPoint = (flag) =>{
            this.xRespawn = flag.x
            this.yRespawn = flag.y-50;
            this.curentLives += 1;
            this.updateLiveCount();
            flag.claimed = true;
        }
        this.physics.add.overlap(my.sprite.player, this.flagGroup, (obj1,obj2) => {
            if (!obj2.claimed){
                my.vfx.checkPoint.startFollow(obj2, obj2.displayWidth/2-7, obj2.displayHeight/2-5, false);
                my.vfx.checkPoint.start();
                this.checkpointParticles = true;
                this.checkpointCounter = 0;
                this.checkpointSound.play();
                this.setCheckPoint(obj2);
            }
        })

        //Ladder Movement
        this.ladderMovementUp = () => {my.sprite.player.setVelocityY(-200);}
        this.physics.add.overlap(my.sprite.player, this.ladderGroup, () => {this.ladderMovementUp();});

        //Win Condition
        this.physics.add.overlap(my.sprite.player, this.endFlag, () => {
            if (this.playOnce){
                this.victorySound.play();
                this.playOnce = false;
            }
            this.victory = true;
            
        })

        //Snow Movement
        this.snowMovement = () => {my.sprite.player.setVelocityY(-250);}
        this.physics.add.overlap(my.sprite.player, this.snowGroup, () => {this.snowMovement();});

        //JumpPad Movement
        this.jumpMovement = () => {my.sprite.player.setVelocityY(-825);}
        this.physics.add.overlap(my.sprite.player, this.jumpGroup, () => {this.jumpMovement();});
    }

    update() {
        if (!this.gameOver && !this.victory){ 


        if (this.starParticles){
            this.starCounter++;
            if (this.starCounter > this.starCDRRate){
                my.vfx.coinGrab.stop();
                this.starCounter = 0;
                this.starParticles = false;
            }
        }

        
        if (this.checkpointParticles){
            this.checkpointCounter++;
            if (this.checkpointCounter > this.checkpointCDR){
                my.vfx.checkPoint.stop();
                this.checkpointCounter = 0;
                this.checkpointParticles = false;
            }
        }

        if(cursors.left.isDown || this.aKey.isDown) {
            if (this.ACCELERATION <= 0){
               my.sprite.player.setVelocityX(20)
            }
            this.ACCELERATION = this.ACCELERATIONSPEED;
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.Background0.tilePositionX -= 0.05;
            my.Background1.tilePositionX -= 0.0005
            my.Background2.tilePositionX -= 0.075;

        } else if(cursors.right.isDown || this.dKey.isDown) {
            if (this.ACCELERATION >= 0){
                my.sprite.player.setVelocityX(-20)
            }
            this.ACCELERATION = -(this.ACCELERATIONSPEED);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.Background0.tilePositionX += 0.05;
            my.Background1.tilePositionX += 0.0005
            my.Background2.tilePositionX += 0.1;

        } else {
            if (my.sprite.player.body.blocked.down) {
                if (this.ACCELERATION > 0){
                my.sprite.player.setVelocityX(10)
            }
                else if (this.ACCELERATION < 0){
                my.sprite.player.setVelocityX(-10);
            }
        }
            // Set acceleration to 0 and have DRAG take over
            this.ACCELERATION = 0;
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

        }
        my.sprite.player.setAccelerationX(-this.ACCELERATION);

        //Tutorial Text Checks
        if (my.sprite.player.x < 200 && my.sprite.player.x > 25){
                my.text.firstTut.setVisible(true);
        }
        else if (my.text.firstTut.visible) my.text.firstTut.setVisible(false);
        if (my.sprite.player.x < 470 && my.sprite.player.x > 340){
            if (my.sprite.player.y < 305 && my.sprite.player.y > 175){
                my.text.secTut.setVisible(true);
            }
            else if (my.text.secTut.visible) my.text.secTut.setVisible(false);
        }
        else if (my.text.secTut.visible) my.text.secTut.setVisible(false);

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            my.vfx.jumping.stop();
        }
        else {
            my.vfx.jumping.start();
            let number = Math.random()*(600-(-600)+1)+(-600)
            this.jumpsound.setDetune(number)
            this.jumpsound.play();
        }
        if(my.sprite.player.body.blocked.down && (Phaser.Input.Keyboard.JustDown(cursors.up) || this.wKey.isDown)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }


        //Reset level code with R
        // if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
        //     this.scene.restart();
        // }


        //
        if(my.sprite.player.y > 525) {
            this.playerRespawn();
        }


    }
    else {
        //This code only runs when the game is over.
            if (this.gameOver) my.sprite.player.setVisible(false);
            my.sprite.player.body.setAllowGravity(false);
            my.sprite.player.setVelocityY(0);
            my.sprite.player.setVelocityX(0);
            if (this.gameOver){
            my.text.gameOverText.setVisible(true);
        }
            if (this.victory) {
                this.createVictoryText();
            my.text.victorytext.setVisible(true);
        }
        if(Phaser.Input.Keyboard.JustDown(this.rKey) || this.slashKey.isDown) {
            this.restartGame();
        }
    }

    }
}