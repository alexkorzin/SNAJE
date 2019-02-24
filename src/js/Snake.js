import * as THREE from 'three';
// import './lib/raf';
import { score } from './score';
import { randomFill } from 'crypto';

import { TweenMax, TimelineLite } from "gsap/TweenMax";


export default class Snake {
    constructor(size, fieldSize, world, color) {
        this.length = 5;
        this.speed = 280;
        this.direction = 'right';
        this.size = size || 1;

        this.headPositionX = 0;
        this.headPositionY = 0;
        this.headPositionZ = 0;
        this.meshs = [];

        this.blinkTl = new TimelineLite();
        this.scaleTL = new TimelineLite();


        this.color = color;

        this.fieldSize = fieldSize || 12;

        this.world = world;

        this.scale = 1;

        this.geometry = new THREE.BoxGeometry(this.size * 0.92, this.size * 0.92, this.size * 0.92);
        this.material = new THREE.MeshStandardMaterial({ color: this.color, wireframe: false });
        this.materialHead = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: false });


        this.originalColor = {
            r: this.material.color.r,
            g: this.material.color.g,
            b: this.material.color.b
        }
    }

    addBlock() {
        // Animate snake color before add new block
        this.blinkTl.to(this.material.color, 0.2, { r: 1, g: 1, repeat: 1, yoyo: true });
        this.scaleTL.to(this.meshs[0].scale, 0.15, { x: 1.15, y: 1.15, z: 1.15, repeat: 1, yoyo: true })
        // Add new block
        this.length++;

        // Create mesh and push it to world
        let snakeBlockMesh = new THREE.Mesh(this.geometry, this.material);
        snakeBlockMesh.castShadow = true;
        snakeBlockMesh.receiveShadow = true;
        snakeBlockMesh.position.x = this.meshs[1].position.x;
        snakeBlockMesh.position.y = this.meshs[1].position.y;
        snakeBlockMesh.position.z = this.meshs[1].position.z;
        this.meshs.push(snakeBlockMesh);
        this.world.add(snakeBlockMesh);

        score(this.length)
    }

    blocksInit() {
        // score(this.length)
        for (let i = 0; i < this.length; i++) {
            let snakeBlockMesh = new THREE.Mesh(this.geometry, this.material);

            snakeBlockMesh.castShadow = true;
            snakeBlockMesh.receiveShadow = true;

            this.meshs.push(snakeBlockMesh);
            this.world.add(snakeBlockMesh);
        }

        this.meshs[0].material = this.materialHead;
    }

    crawl(playSound) {
        switch (this.direction) {
            case 'right':
                this.headPositionX++;
                if (this.headPositionX >= this.fieldSize) {
                    this.headPositionX = -0;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();
                }
                break

            case 'left':
                this.headPositionX--;
                if (this.headPositionX < 0) {
                    this.headPositionX = this.fieldSize - 1;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();

                }
                break

            case 'forward':
                this.headPositionY++;
                if (this.headPositionY >= this.fieldSize) {
                    this.headPositionY = 0;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();

                }
                break

            case 'back':
                this.headPositionY--;
                if (this.headPositionY < 0) {
                    this.headPositionY = this.fieldSize - 1;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();

                }
                break

            case 'down':
                this.headPositionZ--;
                if (this.headPositionZ < 0) {
                    this.headPositionZ = this.fieldSize - 1;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();

                }
                break

            case 'up':
                this.headPositionZ++;
                if (this.headPositionZ >= this.fieldSize) {
                    this.headPositionZ = 0;
                    playSound('translate', { volume: .2 });
                    this.translateAnimation();

                }
                break
        }
        // Rest Elements move
        for (let i = this.length - 1; i > 0; i--) {
            this.meshs[i].position.x = this.meshs[i - 1].position.x
            this.meshs[i].position.y = this.meshs[i - 1].position.y
            this.meshs[i].position.z = this.meshs[i - 1].position.z
        }

        // Head Element move
        this.meshs[0].position.x = this.headPositionX * this.size;
        this.meshs[0].position.y = this.headPositionY * this.size;
        this.meshs[0].position.z = this.headPositionZ * this.size;
    }
    logic(scene, apple, playSound, dots) {
        // When head element colide with other snake's elemnts
        let eltd = 0;

        let colapseTl = new TimelineLite();

        for (let i = 3; i < this.length; i++) {
            if (this.meshs[0].position.x == this.meshs[i].position.x &&
                this.meshs[0].position.y == this.meshs[i].position.y &&
                this.meshs[0].position.z == this.meshs[i].position.z) {
                playSound('colapse', { volume: 0.1 });
                this.blinkTl.to(this.material.color, 0.2, { b: 1, repeat: 1, yoyo: true });

                eltd = this.length - i;
                this.length = i;
                for (let j = i; j < this.meshs.length; j++) {
                    let selectedObject = this.world.getObjectById(this.meshs[j].id);

                    // Colapse animation
                    colapseTl.to(selectedObject.position, 1.5, { z: selectedObject.position.z - this.size * 5 }, "-0.002")
                    colapseTl.to(selectedObject.scale, 0.5, {
                        x: 0.000000001, y: 0.000000001, z: 0.000000001, onComplete: () => {
                            this.world.remove(selectedObject);
                        }
                    }, "-0.002");

                }
            }
        }
        for (let j = 0; j < eltd; j++) {
            this.meshs.pop();
        }

        // When head eat apple
        if (apple.mesh.position.x == this.meshs[0].position.x &&
            apple.mesh.position.y == this.meshs[0].position.y &&
            apple.mesh.position.z == this.meshs[0].position.z) {
            this.addBlock();
            apple.spawn(this);
            playSound('eat', { volume: 1 });

            let tl = new TimelineLite();
            tl.to(dots[0].material, 0.15, { opacity: 0.25, repeat: 1, yoyo: true })
        }
    }

    translateAnimation() {
        this.scaleTL.from(this.meshs[0].scale, 0.3, { x: 0.0000001, y: 0.0000001, z: 0.0000001 })
        this.blinkTl.to(this.material, 0.2, { opacity: 0.5, repeat: 1, yoyo: true });
    }

    pauseAnimation(gameState) {
        if (gameState == "pause") {
            this.blinkTl.to(this.material.color, 0.5, { b: 0.8})
        }
        if (gameState == "play") {
            this.blinkTl.to(this.material.color, 0.5, {b: this.originalColor.b });
        }
    }
}