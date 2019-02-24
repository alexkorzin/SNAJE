import * as THREE from 'three';

import {TweenMax, TimelineLite} from "gsap/TweenMax";


export default class Apple {
    constructor(boxSize, fieldSize, world, color) {
        this.size = boxSize;
        this.fieldSize = fieldSize;
        this.x = Math.floor(Math.random() * (this.fieldSize));
        this.y = Math.floor(Math.random() * (this.fieldSize));
        this.z = Math.floor(Math.random() * (this.fieldSize));
        this.mesh;

        this.color = color;

        this.world = world;

        this.tl = new TimelineLite();

        this.geometry = new THREE.BoxGeometry(this.size * 0.94, this.size * 0.94, this.size * 0.94);
        this.material = new THREE.MeshStandardMaterial({ color: this.color, wireframe: false });
    }

    init() {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.world.add(this.mesh);
    }
    spawn(snake) {
        

        snake.meshs.forEach(mesh => {
            while (mesh.position.x == this.x * this.size && mesh.position.y == this.y * this.size && mesh.position.z == this.z * this.size) {
                this.x = Math.floor(Math.random() * (this.fieldSize));
                this.y = Math.floor(Math.random() * (this.fieldSize));
                this.z = Math.floor(Math.random() * (this.fieldSize));
            }
        })
        this.mesh.position.x = this.x * this.size;
        this.mesh.position.y = this.y * this.size;
        this.mesh.position.z = this.z * this.size;
        this.mesh.scale.set(0, 0, 0);

        this.tl.fromTo(this.mesh.scale, 0.7, {x:0.00000001, y:0.00000001, z:0.00000001},{x:1, y:1, z:1, ease: Back.easeOut.config(3)})
    }
}