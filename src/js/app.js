import * as THREE from 'three';
import Snake from './Snake';
import Apple from './Apple';
import Field from './Field';
import Visualizer from './Visualizer';
import Timer from './Timer'
import Mouse from './Mouse'
import CameraController from './CameraController'
import { moveParticles, createParticles } from './particles';
import { generateTexture } from './textureGenerator';
import * as dat from 'dat.gui';
import { TweenMax, TimelineLite } from "gsap/TweenMax";
import Prelin from './lib/perlin'
import { debounce, throttle } from 'underscore'
import Perlin from './lib/perlin';

window.addEventListener('load', function () {
    if (window.innerWidth < 800) {
        document.querySelector('.mobile').style.display = "block";
    }
    else {
        loadGame();
    }
})



// Scene objects
let scene, camera, renderer, world, worldRotatable, octa;

// Game objects
let snake, apple, field, vis, timer, mouse;

let boxSize = 1;
let fieldSize = 12;
let snakeDirection = 'right';

let worldSize = boxSize * fieldSize;
let shadow = true;
let particles = [];
let gameState = 'menu';

let dots = [];
let dotsGroup;

let colors = {
    sceneColor: '#21bfe1',
    apple: "#61dc7d",
    snake: "#ebb468",
}

let stick = {
    size: { x: 7, y: 7, z: 7 },
    color: "#0087d2",
    far: 101,
    near: 40
}

var soundContext = new AudioContext();

let controlsPack, controls, sounds;

let menuEl = document.querySelector('.menu');
document.body.style.background = colors.sceneColor;
mouse = new Mouse();
let camController = new CameraController();


function loadSound(name) {
    var sound = sounds[name];

    var url = sound.url;
    var buffer = sound.buffer;

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        soundContext.decodeAudioData(request.response, function (newBuffer) {
            sound.buffer = newBuffer;
        });
    }

    request.send();
}
function playSound(name, options) {
    var sound = sounds[name];
    var soundVolume = sounds[name].volume || 1;

    var buffer = sound.buffer;
    if (buffer) {
        var source = soundContext.createBufferSource();
        source.buffer = buffer;

        var volume = soundContext.createGain();

        if (options) {
            if (options.volume) {
                volume.gain.value = soundVolume * options.volume;
            }
        } else {
            volume.gain.value = soundVolume;
        }

        volume.connect(soundContext.destination);
        source.connect(volume);
        source.start(0);
    }
}
function playMainTheme() {
    let audio = new Audio('./sounds/maintheme.mp3');
    audio.volume = 0.03;
    audio.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
    audio.play();
}
function loadJSON() {
    return new Promise((resolve, reject) => {
        let controlsRequestURL = './setup.json'
        let request = new XMLHttpRequest();
        request.open('GET', controlsRequestURL);
        request.responseType = 'json';
        request.onload = () => resolve(request.response);
        request.onerror = () => reject();
        request.send();
    })
}

function onKeyDown(e) {
    e = e || window.event;
    // Dependent
    if (e.keyCode == controls.Forward.keyCode) {
        if (snake.direction != 'back') {
            snakeDirection = 'forward';
            playSound('control', { volume: .08 })
        }
    }
    else if (e.keyCode == controls.Back.keyCode) {
        if (snake.direction != 'forward') {
            snakeDirection = 'back';
            playSound('control', { volume: .08 })
        }
    }
    else if (e.keyCode == controls.Left.keyCode) {
        if (snake.direction != 'right') {
            snakeDirection = 'left';
            playSound('control', { volume: .08 })
        }
    }
    else if (e.keyCode == controls.Right.keyCode) {
        if (snake.direction != 'left') {
            snakeDirection = 'right';
            playSound('control', { volume: .08 })
        }
    }

    // Commons
    else if (e.keyCode == controlsPack.common.Up.keyCode) {
        if (snake.direction != 'down') {
            snakeDirection = 'up';
            playSound('control', { volume: .08 })
        }
    }
    else if (e.keyCode == controlsPack.common.Down.keyCode) {
        if (snake.direction != 'up') {
            snakeDirection = 'down';
            playSound('control', { volume: .08 })
        }
    }
    else if (e.keyCode == controlsPack.common.Pause.keyCode) {
        if (gameState != 'menu') {
            if (gameState == 'pause') {
                gameState = 'play';
                playSound('control', { volume: .08 });
                snake.pauseAnimation(gameState);
            }
            else {
                gameState = 'pause';
                playSound('control', { volume: .08 })
                snake.pauseAnimation(gameState);
            }
        }
    }

    // // Rotate 
    // else if (e.keyCode == controlsPack.common.RotateL.keyCode) {
    //     camController.rotateRight(worldRotatable, translateControls, playSound);
    // }
    // else if (e.keyCode == controlsPack.common.RotateR.keyCode) {
    //     camController.rotateLeft(worldRotatable, translateControls, playSound);
    // }
}
function translateControls() {
    controls = controlsPack["controls" + Math.abs(camController.xStep) % 4];
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    vis.canvas.height = window.innerHeight;
    vis.canvas.width = window.innerWidth / vis.prop;
}
function initScene() {
    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0)
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    if (shadow) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    // light
    let ambientLight, light, light2, color;
    color = 0xffffff

    ambientLight = new THREE.AmbientLight(color, 1.8);
    light2 = new THREE.PointLight(color, 0.2, 50);
    light = new THREE.PointLight(color, 0.5, 100);
    light.position.set(-worldSize / 2, -worldSize / 2, worldSize * 1.5);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = boxSize;
    light.shadow.camera.far = worldSize * 2;
    worldRotatable.add(light);

    // camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, boxSize, 100);
    camera.position.y = -boxSize * fieldSize * 2;
    camera.position.z = fieldSize + 4;
    camera.add(light2);



    // scene
    scene = new THREE.Scene();
    scene.add(camera);
    scene.add(ambientLight);
    scene.fog = new THREE.Fog(colors.sceneColor, stick.near, stick.far);
}
function introAnimation() {
    let tl = new TimelineLite();
    tl.fromTo(menuEl, 1, { y: 100, opacity: 0 }, { y: 0, opacity: 1 }, 0.4);

    let initTl = new TimelineLite();
    initTl.fromTo(worldRotatable.scale, 2, { x: 0.0000001, y: 0.0000001, z: 0.0000001 }, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(1) }, 0.4)
    initTl.from(dotsGroup.position, 2, { z: -250, ease: Back.easeOut.config(1) }, 0.3)
}
function wrapWorld() {
    //  Move pivot to 0,0,0
    world = new THREE.Group();
    worldRotatable = new THREE.Group();
    world.position.x = -boxSize * (fieldSize / 2) + boxSize / 2;
    world.position.y = -boxSize * (fieldSize / 2) + boxSize / 2;
    world.position.z = -boxSize / 2;
    worldRotatable.add(world);
}
function addParctiles(count) {
    let particlesCount = count;
    for (let i = 0; i < particlesCount; i++) {
        let newParticle = createParticles(boxSize * 1.5, worldSize, 0.7);
        particles.push(newParticle);
        worldRotatable.add(newParticle);
    }
}
function createOcta() {
    let octaMaterial = new THREE.MeshStandardMaterial({ color: colors.apple, wireframe: false });
    var octaOutineMaterial = new THREE.LineBasicMaterial({ color: colors.apple, transparent: true, opacity: 0.1 });

    let octaGeometry = new THREE.IcosahedronBufferGeometry(boxSize * 1.5, 0);

    let smallOctaGeometry = new THREE.IcosahedronBufferGeometry(boxSize, 0);

    let octaEdges = new THREE.EdgesGeometry(octaGeometry);
    let octaSegments = new THREE.LineSegments(octaEdges, octaOutineMaterial);

    octa = new THREE.Mesh(smallOctaGeometry, octaMaterial)

    octaSegments.position.set(0, 0, worldSize + boxSize * 2);
    octa.position.set(0, 0, worldSize + boxSize * 2);

    worldRotatable.add(octaSegments, octa);
}
function createDots(double) {
    dotsGroup = new THREE.Group();
    let count = 25;
    let dist = 1;
    let material = new THREE.MeshBasicMaterial({ color: stick.color, opacity: 1, transparent: true });
    let geometry = new THREE.BoxGeometry(stick.size.x, stick.size.y, stick.size.z);

    for (let j = 0; j < count; j++) {
        for (let i = 0; i < count; i++) {
            let mesh = new THREE.Mesh(geometry, material)
            mesh.fixed = -20;

            mesh.position.x = (-stick.size.x * (count / 2) + (worldSize / 2 * (boxSize)) * dist) + i * stick.size.x * dist;
            mesh.position.y = (-stick.size.x * (count / 2) + (worldSize / 2 * (boxSize)) * dist) + j * stick.size.x * dist;

            dotsGroup.add(mesh)
            dots.push(mesh);
        }
    }

    if (double) {
        for (let u = 0; u < count; u++) {
            for (let z = 0; z < count; z++) {
                let mesh2 = new THREE.Mesh(geometry, material)
                mesh2.fixed = 27;

                mesh2.position.z = -3;
                mesh2.position.x = (-stick.size.x * (count / 2) + (worldSize / 2 * (boxSize)) * dist) + z * stick.size.x * dist;
                mesh2.position.y = (-stick.size.x * (count / 2) + (worldSize / 2 * (boxSize)) * dist) + u * stick.size.x * dist;

                dotsGroup.add(mesh2)
                dots.push(mesh2);
            }
        }
    }
    world.add(dotsGroup)
}
function addControlsTips(controls) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('guiControls');

    for (let prop in controls) {
        let guiControls_item = document.createElement('div');
        guiControls_item.classList.add('guiControls_item');

        let action = document.createElement('div');
        action.classList.add('actionName');
        action.innerHTML = prop;

        let buttonName = document.createElement('div');
        buttonName.classList.add('buttonName');
        buttonName.innerHTML = controls[prop].key;

        wrapper.appendChild(guiControls_item);
        guiControls_item.appendChild(buttonName);
        guiControls_item.appendChild(action);
    }
    document.body.appendChild(wrapper);

    // Animate
    let tl = new TimelineLite();
    tl.fromTo(wrapper, 0.5, { opacity: 0 }, { opacity: 1 }, "+1.65");
}
function addMenuBestScore() {
    let bestScoreEl = document.querySelector('.menu_bestScore');
    if (localStorage.getItem('bestScore')) {
        bestScoreEl.innerHTML = "Your best score: " + localStorage.getItem('bestScore');
    } else {
        bestScoreEl.innerHTML = "Your best score: 0";
    }
}
function addGui() {
    let gui = new dat.GUI();

    gui.add(stick, "near", 0, 50).onChange(function () {
        scene.fog = new THREE.Fog(colors.sceneColor, stick.near, stick.far);
    })

    gui.add(stick, "far", 0, 200).onChange(function () {
        scene.fog = new THREE.Fog(colors.sceneColor, stick.near, stick.far);
    })

    gui.addColor(colors, 'sceneColor').onChange(function () {
        document.body.style.background = colors.sceneColor;
        scene.fog = new THREE.Fog(colors.sceneColor, stick.near, stick.far);
    });

    gui.addColor(stick, "color").onChange(function () {
        let color = new THREE.Color(stick.color);
        dots.forEach(dot => {
            dot.material.color = color;
        })
    })

    gui.addColor(colors, 'snake').onChange(function () {
        vis.color = colors.snake;
        let color = new THREE.Color(colors.snake);
        snake.material.color = color
    })

    gui.addColor(colors, 'apple').onChange(function () {
        let color = new THREE.Color(colors.apple);
        apple.material.color = color
        octa.material.color = color
        field.pAppleMaterial.color = color
    })
}
function addEventListeners() {
    window.document.addEventListener('click', function (e) {
        e.preventDefault();
        camController.rotateLeft(worldRotatable, translateControls, playSound, field, mouse);
        return false;
    })

    window.document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        camController.rotateRight(worldRotatable, translateControls, playSound, field, mouse);
        return false;
    })

    document.onkeydown = onKeyDown;

}

let t = 1000;
function animationTick() {
    renderer.render(scene, camera);
    moveParticles(particles, worldSize);

    vis.draw((snake.length) / (fieldSize * fieldSize * fieldSize) + 0.04);
    vis.drawScore((snake.length) / (fieldSize * fieldSize * fieldSize) + 0.04, snake.length)

    apple.mesh.rotation.z += 0.02;
    octa.rotation.z += 0.01;

    timer.gameState = gameState;
    timer.draw();

    field.drawProjection(snake, apple);

    camController.rotate(camera, mouse, worldRotatable, boxSize, fieldSize);

    t++;
    dots.forEach((dot, n) => {
        dot.position.z = dot.fixed + Perlin(dot.position.x / 150 * t / 100, dot.position.y / 150 * t / 100, t / 100) * 7;
        // dot.material.opacity = Perlin(dot.position.x / 150 * t/100, dot.position.y / 150 * t/100, t / 100);
    })
}
function gameTick() {
    if (gameState == 'play') {
        snake.direction = snakeDirection;
        snake.crawl(playSound);
        snake.logic(scene, apple, playSound, dots);
    }
}
function initGame() {
    snake = new Snake(boxSize, fieldSize, world, colors.snake);
    apple = new Apple(boxSize, fieldSize, world, colors.apple);
    field = new Field(fieldSize, boxSize, world, colors.apple);
    timer = new Timer();
    vis = new Visualizer('#ffe65d');

    vis.init(10);
    vis.canvas.style.left = "-100%";

    initScene();
    scene.add(worldRotatable);

    apple.init();
    apple.spawn(snake);

    field.initProjection();
    field.drawCube(scene);

    snake.blocksInit();

    timer.init();
    timer.canvas.style.top = "-100%";
    timer.tick();

    addParctiles(30);
    createOcta();
    createDots(false);
    // addGui();
}
function loadGame() {
    loadJSON().then((XHRResponse) => {
        controlsPack = XHRResponse.controls;
        controls = controlsPack.controls0;
        sounds = XHRResponse.sounds;
        for (var key in sounds) {
            loadSound(key);
        }
    });
    wrapWorld();
    initGame();
    introAnimation();
    addMenuBestScore();
    setInterval(gameTick, snake.speed);

    window.onresize = onWindowResize;

    TweenMax.ticker.addEventListener("tick", animationTick)

    let playButton = document.querySelector('.menu_play');
    playButton.addEventListener('click', function () {
        playMainTheme();
        playSound('click', { volume: .2 });
        startGame();
    });


}
function startGame() {
    let tl = new TimelineLite();
    tl.to(vis.canvas, 1, { left: "0%" }, "0");
    tl.to(timer.canvas, 1, { top: "10px" }, "0");
    tl.to(menuEl, 0.8, {
        scale: 0.8, opacity: 0, onComplete: function () {
            gameState = "play";
            menuEl.remove();
            addControlsTips(controlsPack.common);
            addEventListeners()
        }
    }, "0");
}

















