function main(heart = false) {
  const canvas = document.getElementById('myCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Bar {
    constructor(x, y, width, height, color) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.sound = 0;
      this.maxSound = 50;
      this.minInput = 0;
      this.maxInput = 0;
    }
    update(micInput) {
      let sound = micInput * 10000;
      if (sound > this.maxInput) {
        this.maxInput = sound;
        this.minInput = sound / 3;
      }

      sound = invLerp(0, this.maxInput, sound) * this.maxSound;
      this.sound = sound > this.sound ? lerp(0, sound, 0.8) : lerp(this.sound, 0, 0.03);
      this.maxInput -= this.maxInput > this.minInput ? 8 : 0;
    }
    draw(context) {
      context.fillStyle = this.color;
      context.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height - this.sound);
    }
    drawHeart(ctx, color) {
      var x = 0;
      var y = 0;
      var width = this.width / 2 + this.sound;
      var height = width;
      ctx.save();
      ctx.translate(0, -height / 2);
      ctx.beginPath();
      var topCurveHeight = height * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      // top left curve
      ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);

      // bottom left curve
      ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height);

      // bottom right curve
      ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight);

      // top right curve
      ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);

      ctx.closePath();
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }
  const fftSize = 256;
  const fftSizeQuarter = fftSize/4;
  const microphone = new Microphone(fftSize);
  const black_bar = new Bar(0, 0, 300, 150, 'black');
  const white_bar = new Bar(0, 0, 300, 50, 'white');
  const bars = [];
  function createBars() {
    for (let i = 0; i < fftSize; i++) {
      bars.push( 
        new Bar(i - fftSizeQuarter, 25, 1, 0, 'red'))
    }
  }
  createBars();
  function animate() {
    if (microphone.initialized) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      const samples = microphone.getSamples();
      black_bar.draw(ctx);
      white_bar.draw(ctx);
      bars.forEach(function(bar, i) {
        bar.update(samples[i]);
        bar.draw(ctx);
      });
      ctx.restore();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

function lerp(a, b, n) {
  return (1 - n) * a + n * b;
}

function invLerp(a, b, v) {
  return (v - a) / (b - a);
}
