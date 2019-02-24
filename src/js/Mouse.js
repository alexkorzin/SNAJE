export default class Mouse {
    constructor(){
        this.x = 0;
        this.y = 0;
        this.speed = 0
        this.position = 0;

        document.body.addEventListener('mousemove',  (e) => {
            this.position = ((window.innerWidth / 2 - e.clientX) / window.innerWidth) * 1.8;
            this.x = e.clientX;
            this.y = e.clientY;
        });

        document.body.addEventListener('wheel', (e) => {
            this.speed += e.deltaY * 0.001;
        })
    }
}