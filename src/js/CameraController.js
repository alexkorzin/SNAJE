import * as THREE from 'three';
import { TweenMax, TimelineLite } from "gsap/TweenMax";

export default class CameraController {
    constructor() {
        this.xStep = 4;
        this.yStep = 0;
        this.tl = new TimelineLite();
        this.isAnimating = false;
        this.rotator = 0;
        this.cameraPosition = 0;
    }

    rotateRight(worldRotatable, rotateControls, playSound, field, mouse) {
        if (this.isAnimating) {
            return false;
        }
        this.isAnimating = true;

        let nextXStep = this.xStep + 1;
        playSound('rotate', { volume: 0.2 })
        field.rotateAnimation();
        this.tl.to(this, 0.3, {
            xStep: nextXStep,
            onUpdate: () => {
                worldRotatable.rotation.z = this.xStep * Math.PI / 2 + mouse.position / 1.5;
            },
            onComplete: () => {
                rotateControls();
                this.isAnimating = false;
            }
        })
    }

    rotateLeft(worldRotatable, rotateControls, playSound, field, mouse) {
        if (this.isAnimating) {
            return false;
        }
        this.isAnimating = true;

        if (this.xStep < 1) {
            this.xStep = 4;
        }

        let nextXStep = this.xStep - 1;
        playSound('rotate', { volume: 0.2 })
        field.rotateAnimation();
        this.tl.to(this, 0.3, {
            xStep: nextXStep,
            onUpdate: () => {
                worldRotatable.rotation.z = this.xStep * Math.PI / 2 + mouse.position / 1.5;
            },
            onComplete: () => {
                rotateControls();
                this.isAnimating = false;
            }
        })
    }

    rotate(camera, mouse, worldRotatable, boxSize, fieldSize) {
        worldRotatable.rotation.z = this.xStep * Math.PI / 2 + mouse.position / 1.5;

        this.cameraPosition += mouse.speed;
        mouse.speed *= 0.95;

        if (this.cameraPosition < -fieldSize/1.5) {
            this.cameraPosition = -fieldSize/1.5;
            mouse.speed = 0;
        }
        if (this.cameraPosition > fieldSize/1.5) {
            this.cameraPosition = fieldSize/1.5;
            mouse.speed = 0;
        }

        camera.position.z = fieldSize + 4 + this.cameraPosition;
        camera.lookAt(new THREE.Vector3(0, 0, boxSize * fieldSize / 2));
    }
}
