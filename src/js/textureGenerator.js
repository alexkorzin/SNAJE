export function generateTexture(color1, color2) {
    // create canvas
    let canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // get context
    let context = canvas.getContext('2d');

    // draw gradient
    context.rect(0, 0, window.innerWidth, window.innerHeight);
    var gradient = context.createRadialGradient(window.innerWidth/2,
         window.innerHeight / 20,
         5,
         window.innerWidth/2,
         window.innerHeight / 2,
         window.innerWidth/1.5);

    // Add three color stops
    gradient.addColorStop(0, color2);
    gradient.addColorStop(.6, color1);
    context.fillStyle = gradient;
    context.fill();

    return canvas;
}