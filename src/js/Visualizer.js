import Perlin from './lib/perlin';

export default class Visualizer {
    constructor(color) {
        this.time = 0;
        this.ctx;
        this.canvas;
        this.prop;
        this.color = color;
    }

    init(prop) {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';
        this.canvas.style.zIndex = '10';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth / prop;
        this.prop = prop;
    }

    draw(percent) {
        this.time++;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Stroke whole canvas
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)'
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.restore()

        // Make waves
        this.ctx.save()
        this.ctx.beginPath();
        for (let i = 0; i < window.innerWidth / this.prop; i++) {
            let y = Perlin(this.time / 2000 + i / 10, this.time / 70, 0) * 30 + window.innerHeight - window.innerHeight * percent
            this.ctx.lineTo((i + 1) * 10 - 10, y);
        }
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.lineTo(0, this.canvas.height);
        this.ctx.lineTo(0, Perlin(this.time / 200, this.time / 1000, 0) * 100);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        this.ctx.closePath()
        this.ctx.restore();
    }

    drawScore(percent, score){
        // best
        this.ctx.save();
        this.ctx.font = "100 16px Montserrat";
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.textAlign = "center";
        this.ctx.fillText('Your best', this.canvas.width / 2, this.canvas.height / 2 - 150);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.font = "100 18px Montserrat";
        this.ctx.fillStyle = 'rgba(255,255,255,1)';
        this.ctx.textAlign = "center";
        this.ctx.fillText(localStorage.getItem('bestScore'), this.canvas.width / 2, this.canvas.height / 2 - 125);
        this.ctx.restore();

        // Score
        this.ctx.save();
        this.ctx.font = "100 16px Montserrat";
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.textAlign = "center";
        this.ctx.fillText('Score', this.canvas.width / 2, this.canvas.height / 2 - 42);
        this.ctx.restore();

        this.ctx.save();
        this.ctx.font = "100 40px Montserrat";
        this.ctx.fillStyle = 'rgba(255,255,255,1)';
        this.ctx.textAlign = "center";
        this.ctx.fillText(score, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.restore();

        // Percents
        this.ctx.save();
        this.ctx.font = "100 18px Montserrat";
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.textAlign = "center";
        this.ctx.fillText(Math.floor(percent * 100) - 4 + "%", this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.restore();
    }
}