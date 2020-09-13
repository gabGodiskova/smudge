var mainstate = {
	preload: function() {
		flappySmudge.load.image('smudge', 'images/smudge.png');
		flappySmudge.load.image('cucumber', 'images/pipember.png');
		flappySmudge.load.audio('jumpSmudge', 'sounds/jump.wav');	//https://freesound.org/people/cabled_mess/sounds/350900/
		flappySmudge.load.audio('fall', 'sounds/fall.wav');			//https://freesound.org/people/timtube/sounds/58981/?fbclid=IwAR2cgVcPKLekPH2bLPPvRLDz9g1O66cO1NCjSfEK4_M2n8JMJDBng1vj4TA
		flappySmudge.load.audio('song', 'sounds/song.mp3');			//https://freesound.org/people/yummie/sounds/410574/
	},

	create: function() {
		flappySmudge.stage.backgroundColor = '#A5D8FF';
		flappySmudge.physics.startSystem(Phaser.Physics.ARCADE);

		this.smudge = flappySmudge.add.sprite(100, 245, 'smudge');
		this.key = flappySmudge.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.key.onDown.add(this.startGame, this);
		this.paused = true;

		this.startText = flappySmudge.add.text(30, 200, "press spacebar", {font: "60px VT323", fill: "#F12929"});

		this.jumpSound = flappySmudge.add.audio('jumpSmudge');
		this.fallSound = flappySmudge.add.audio('fall');
		this.songSound = flappySmudge.add.audio('song');
	},

	startGame: function() {
		this.songSound.loop = true;
		this.songSound.play();
		this.paused = false;
		this.key.onDown.remove(this.startGame, this);
		this.key.onDown.add(this.jump, this);
		this.startText.text = "";

		flappySmudge.physics.arcade.enable(this.smudge);
		this.smudge.anchor.setTo(-0.2, 0.5);
		this.smudge.body.gravity.y = 1000;

		this.cucumbers = flappySmudge.add.group();
		this.timer = flappySmudge.time.events.loop(1500, this.addLotsOfCucumbers, this);

		this.score = 0;
		this.labelScore = flappySmudge.add.text(20, 20, "0", {font: "70px VT323", fill: "#F12929"});
	},

	update: function() {
		if (this.smudge.y < 0 || this.smudge.y > 500) {
			this.restartGame();
		}

		flappySmudge.physics.arcade.overlap(this.smudge, this.cucumbers, this.hitCucumber, null, this);		//smudge overlaps cucumber

		if (!this.paused && this.smudge.angle < 20) {
			this.smudge.angle += 1;
		}
	},

	jump: function() {
		if (!this.smudge.alive) {
			return;
		}

		this.jumpSound.play();

		this.smudge.body.velocity.y = -250;

		var animation = flappySmudge.add.tween(this.smudge);

		//rotation of smudge while jumping
		animation.to({angle: -20}, 100);
		animation.start();
	},

	restartGame: function() {
		flappySmudge.state.start('main');
	},

	//create cucumber, parameter rotate == true makes cucumber rotate

	addCucumber: function(x, y, rotate) {
		var cucumber = flappySmudge.add.sprite(x, y, 'cucumber');

		this.cucumbers.add(cucumber);

		cucumber.displayOriginX = 0;
		cucumber.displayOriginY = 0;

		console.log(Object.keys(cucumber));

		if (rotate) {
			cucumber.displayHeight = -1 * cucumber.height;		//rotating the cucumber upside down
			
			cucumber.anchor.set(0.5, 0.5);
			cucumber.angle += 180;
			cucumber.x += 35;
			cucumber.y += 150;
		}

		flappySmudge.physics.arcade.enable(cucumber);

		cucumber.body.velocity.x = -200;		//cucumbers move to the left

		cucumber.checkWorldBounds = true;
		cucumber.outOfBoundsKill = true;		//cucumbers disappear
	},

	addLotsOfCucumbers: function() {
		const GAP = 150;
		var gapPosition = Math.floor(Math.random() * 250) + 50;		//gap position between a pair of cucumbers

		this.addCucumber(400,gapPosition - 300,true); 	//upper cucumber, rotate == true
		this.addCucumber(400,gapPosition + GAP,false);	//lower cucumber, rotate == false

		this.score += 1;					//score count
		this.labelScore.text = this.score - 1;		//minus one for starting with zero score
	},

	hitCucumber: function() {
		if (!this.smudge.alive) {					
			return;
		}

		this.songSound.stop();
		this.fallSound.play();

		this.smudge.alive = false;
		flappySmudge.time.events.remove(this.timer);

		this.cucumbers.forEach(function(c) {
			c.body.velocity.x = 0;
		}, this);

		flappySmudge.add.text(70, 200, "game over", {font: "70px VT323", fill: "#F12929"});
		flappySmudge.add.text(100, 250, "score: " + (this.score - 1), {font: "50px VT323", fill: "#F12929"});
	}
};

var flappySmudge = new Phaser.Game(400,500);
flappySmudge.state.add('main', mainstate);
flappySmudge.state.start('main');