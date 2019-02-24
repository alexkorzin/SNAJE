export default class Timer {
    constructor() {
        this.ms = 0;
        this.sec = 0;
        this.min = 0;
        this.canvas;
        this.ctx;
        this.height = 35;
        this.width = 110;
        this.gameState = 'play';
    }

    init() {

        this.canvas = document.createElement('canvas');
        this.canvas.height = this.height;
        this.canvas.width = this.width;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '10px';
        this.canvas.style.left = '50%';
        this.canvas.style.transform = 'translate(-50%, 0)';
        this.canvas.style.zIndex = '11';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
    }

    tick() {
        setInterval(() => {
            if (this.gameState == 'play') {
                this.ms += 1;
            }

            if (this.ms > 9) {
                this.ms = 0;
                this.sec++;
            }

            if (this.sec > 59) {
                this.sec = 0;
                this.min++
            }
        }, 100)
    }

    getNormalTime() {
        let ms, sec, min;

        if (this.sec < 10) {
            sec = '0' + this.sec;
        } else sec = this.sec;

        if (this.min < 10) {
            min = '0' + this.min;
        } else min = this.min;

        ms = '0' + this.ms;

        return min + ':' + sec + ':' + ms;
    }

    draw() {
        let radius = 3;
        radius = { tl: radius, tr: radius, br: radius, bl: radius };

        let height = this.height;
        let width = this.width;
        this.ctx.clearRect(0, 0, this.width, this.height)
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(radius.tl, 0);
        this.ctx.lineTo(width - radius.tr, 0);
        this.ctx.quadraticCurveTo(width, 0, width, radius.tr);
        this.ctx.lineTo(width, height - radius.br);
        this.ctx.quadraticCurveTo(width, height, width - radius.br, height);
        this.ctx.lineTo(radius.bl, height);
        this.ctx.quadraticCurveTo(0, height, 0, height - radius.bl);
        this.ctx.lineTo(0, radius.tl);
        this.ctx.quadraticCurveTo(0, 0, radius.tl, 0);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(255,255,255,0.25)';
        this.ctx.fill();
        this.ctx.restore();

        


        if (this.gameState == "pause") {
            this.ctx.save();
            this.ctx.font = "100 18px Montserrat";
            this.ctx.fillStyle = 'rgba(255,255,255,1)';
            // this.ctx.textAlign = "center";
            this.ctx.fillText("Pause", this.width / 2 - 30, this.height / 2 + 5);
            this.ctx.restore();
        } else{
            this.ctx.save();
            this.ctx.font = "100 18px Montserrat";
            this.ctx.fillStyle = 'rgba(255,255,255,1)';
            // this.ctx.textAlign = "center";
            this.ctx.fillText(this.getNormalTime(), this.width / 2 - 38, this.height / 2 + 5);
            this.ctx.restore();
        }
    }
}