import Phaser from 'phaser';

const Breakout = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function Breakout() {
    Phaser.Scene.call(this, { key: 'breakout' });
    this.bricks;
    this.paddle;
    this.ball;
  },

  preload: function() {
    this.load.atlas('assets', './src/assets/breakout/breakout.png', './src/assets/breakout/breakout.json');
  },

  create: function() {
    // enable world bounds, disable the floor
    this.physics.world.setBoundsCollision(true, true, true, false);

    // create bricks in a 10x6 grid
    this.bricks = this.physics.add.staticGroup({
      key: 'assets', frame: ['blue1', 'red1', 'green1', 'yellow1', 'silver1', 'purple1'],
      frameQuantity: 10,
      gridAlign: { width: 10, height: 6, cellWidth: 64, cellHeight: 32, x: 112, y: 100 }
    });

    // create ball
    this.ball = this.physics.add.image(400, 500, 'assets', 'ball1').setCollideWorldBounds(true).setBounce(1);
    this.ball.setData('onPaddle', true);

    // create paddle
    this.paddle = this.physics.add.image(400, 550, 'assets', 'paddle1').setImmovable();

    // the colliders
    this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);

    // input events
    this.input.on('pointermove', function(pointer) {
      this.paddle.x = Phaser.Math.Clamp(pointer.x, 52, 748);
      if (this.ball.getData('onPaddle')) {
        this.ball.x = this.paddle.x;
      }
    }, this);
    this.input.on('pointerup', function(pointer) {
      if (this.ball.getData('onPaddle')) {
        this.ball.setVelocity(-75, -300);
        this.ball.setData('onPaddle', false);
      }
    }, this);
  },

  hitBrick: function(ball, brick) {
    brick.disableBody(true, true);
    if (this.bricks.countActive() === 0) {
      this.resetLevel();
    }
  },

  resetBall: function() {
    this.ball.setVelocity(0);
    this.ball.setPosition(this.paddle.x, 500);
    this.ball.setData('onPaddle', true);
  },

  resetLevel: function() {
    this.resetBall();
    this.bricks.children.each(function(brick) {
      brick.enableBody(false, 0, 0, true, true);
    });
  },

  hitPaddle: function(ball, paddle) {
    let diff = 0;

    // ball is one the left-hand side of paddle
    if (ball.x < paddle.x) {
      diff = paddle.x - ball.x;
      ball.setVelocityX(-10 * diff);
    }
    // ball is on the right-hand side of paddle
    else if (ball.x > paddle.x) {
      diff = ball.x - paddle.x;
      ball.setVelocityX(10 * diff);
    } else {
      // ball is perfectly in middle of paddle
      // add a little random X to stop it bouncing straight up
      ball.setVelocityX(2 + Math.random() * 8);
    }
  },

  update: function() {
    if (this.ball.y > 600) {
      this.resetBall();
    }
  }

});

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  scene: [Breakout],
  physics: {
    default: 'arcade'
  }
};

const game = new Phaser.Game(config);
