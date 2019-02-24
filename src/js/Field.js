import * as THREE from 'three'
import { TweenMax, TimelineLite } from "gsap/TweenMax";


export default class Field {
    constructor(fieldSize, boxSize, world, color) {
        this.size = fieldSize;
        this.boxSize = boxSize;
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1, opacity: 0.4, transparent: true });

        this.pZGeometry = new THREE.PlaneGeometry(this.boxSize, this.boxSize);
        this.pXGeometry = new THREE.PlaneGeometry(this.boxSize, this.boxSize);
        this.pYGeometry = new THREE.PlaneGeometry(this.boxSize, this.boxSize);

        this.color = color;

        this.pMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.7, wireframe: false, transparent: true });
        this.pAppleMaterial = new THREE.MeshBasicMaterial({ color: this.color, opacity: 0.7, wireframe: false, transparent: true, side: THREE.FrontSide });

        this.pZMesh;
        this.pXMesh;
        this.pZMesh;

        this.world = world;

        this.pZAppleMesh;
        this.pXAppleMesh;
        this.pYAppleMesh;
        this.pYAppleMesh;

        this.rorarteTl = new TimelineLite();
    }

    rotateAnimation() {
        this.rorarteTl.to(this.material, 0.1, {opacity: 0.9, repeat: 1, yoyo: true});
    }

    drawCube() {
        let geometry = new THREE.BoxBufferGeometry(this.size * this.boxSize, this.size * this.boxSize, this.size * this.boxSize);
        let edges = new THREE.EdgesGeometry(geometry);
        let line = new THREE.LineSegments(edges, this.material);
        line.position.x = (this.size / 2) * this.boxSize - this.boxSize / 2
        line.position.y = (this.size / 2) * this.boxSize - this.boxSize / 2
        line.position.z = (this.size / 2) * this.boxSize - this.boxSize / 2
        this.world.add(line);

        // Horizontal lines
        for (let i = 1; i <= this.size - 1; i++) {
            let geometry2 = new THREE.Geometry();

            // geometry2.vertices.push(new THREE.Vector3(- boxSize / 2, i * boxSize - boxSize / 2, boxSize * fieldSize - boxSize / 2));
            geometry2.vertices.push(new THREE.Vector3(- this.boxSize / 2, i * this.boxSize - this.boxSize / 2, -this.boxSize / 2.01));
            geometry2.vertices.push(new THREE.Vector3(this.boxSize * this.size - this.boxSize / 2, i * this.boxSize - this.boxSize / 2, -this.boxSize / 2.01));

            let line = new THREE.Line(geometry2, this.material);
            this.world.add(line);
        }

        // Vertical lines
        for (let i = 1; i <= this.size - 1; i++) {
            let geometry2 = new THREE.Geometry();

            geometry2.vertices.push(new THREE.Vector3(i * this.boxSize - this.boxSize / 2, - this.boxSize / 2, -this.boxSize / 2.01));
            geometry2.vertices.push(new THREE.Vector3(i * this.boxSize - this.boxSize / 2, this.boxSize * this.size - this.boxSize / 2, -this.boxSize / 2.01));
            // geometry2.vertices.push(new THREE.Vector3(i * boxSize - boxSize / 2, boxSize * fieldSize - boxSize / 2, boxSize * fieldSize - boxSize / 2));

            let line = new THREE.Line(geometry2, this.material);
            this.world.add(line);


        }
    }

    initProjection() {
        // Snake Head Element projection
        this.pZMesh = new THREE.Mesh(this.pZGeometry, this.pMaterial)
        this.world.add(this.pZMesh);

        this.pXMesh = new THREE.Mesh(this.pXGeometry, this.pMaterial)
        this.world.add(this.pXMesh);

        this.pXMesh2 = new THREE.Mesh(this.pXGeometry, this.pMaterial)
        this.world.add(this.pXMesh2);

        this.pYMesh = new THREE.Mesh(this.pYGeometry, this.pMaterial)
        this.world.add(this.pYMesh);

        this.pYMesh2 = new THREE.Mesh(this.pYGeometry, this.pMaterial)
        this.world.add(this.pYMesh2);

        // Apple projection
        this.pZAppleMesh = new THREE.Mesh(this.pZGeometry, this.pAppleMaterial)
        this.world.add(this.pZAppleMesh);

        this.pXAppleMesh = new THREE.Mesh(this.pXGeometry, this.pAppleMaterial)
        this.world.add(this.pXAppleMesh);

        this.pXAppleMesh2 = new THREE.Mesh(this.pXGeometry, this.pAppleMaterial)
        this.world.add(this.pXAppleMesh2);

        this.pYAppleMesh = new THREE.Mesh(this.pYGeometry, this.pAppleMaterial)
        this.world.add(this.pYAppleMesh);

        this.pYAppleMesh2 = new THREE.Mesh(this.pYGeometry, this.pAppleMaterial)
        this.world.add(this.pYAppleMesh2);

        this.pXAppleMesh.material.side = THREE.BackSide;
    }

    drawProjection(snake, apple, rotation) {
        // Snake Head Element projection

        this.pZMesh.position.x = snake.headPositionX * this.boxSize;
        this.pZMesh.position.y = snake.headPositionY * this.boxSize;
        this.pZMesh.position.z = -this.boxSize / 2;

        this.pYMesh.rotation.x = Math.PI / 2


        this.pXMesh.position.x = (-this.boxSize / 2);
        this.pXMesh.position.y = snake.headPositionY * this.boxSize;
        this.pXMesh.position.z = snake.headPositionZ * this.boxSize;

        this.pXMesh2.position.x = (this.boxSize / 2) * this.size * 2 - (this.boxSize / 2);
        this.pXMesh2.position.y = snake.headPositionY * this.boxSize;
        this.pXMesh2.position.z = snake.headPositionZ * this.boxSize;

        this.pXMesh.rotation.y = Math.PI / 2
        this.pXMesh2.rotation.y = -Math.PI / 2

        this.pYMesh.position.x = snake.headPositionX * this.boxSize;
        this.pYMesh.position.y = (this.boxSize / 2) * this.size * 2 - this.boxSize / 2;
        this.pYMesh.position.z = snake.headPositionZ * this.boxSize;


        this.pYMesh2.position.x = snake.headPositionX * this.boxSize;
        this.pYMesh2.position.y = -(this.boxSize / 2);
        this.pYMesh2.position.z = snake.headPositionZ * this.boxSize;

        this.pYMesh2.rotation.x = -Math.PI / 2;

        // apple

        this.pZAppleMesh.position.x = apple.x * this.boxSize;
        this.pZAppleMesh.position.y = apple.y * this.boxSize;
        this.pZAppleMesh.position.z = -this.boxSize / 2 - 0.001;

        this.pZAppleMesh.rotation.y = - Math.PI


        this.pXAppleMesh.position.x = -this.boxSize / 2  - 0.001;
        this.pXAppleMesh.position.y = apple.y * this.boxSize;
        this.pXAppleMesh.position.z = apple.z * this.boxSize;

        this.pXAppleMesh2.position.x = (this.boxSize / 2) * this.size * 2 - (this.boxSize / 2)  - 0.001;
        this.pXAppleMesh2.position.y = apple.y * this.boxSize;
        this.pXAppleMesh2.position.z = apple.z * this.boxSize;

        this.pXAppleMesh.rotation.y = - Math.PI / 2
        this.pXAppleMesh2.rotation.y = Math.PI / 2


        this.pYAppleMesh.position.x = apple.x * this.boxSize;
        this.pYAppleMesh.position.y = (this.boxSize / 2) * this.size * 2 - this.boxSize / 2  - 0.001;
        this.pYAppleMesh.position.z = apple.z * this.boxSize;

        this.pYAppleMesh.rotation.x = - Math.PI / 2

        this.pYAppleMesh2.position.x = apple.x * this.boxSize;
        this.pYAppleMesh2.position.y = -(this.boxSize / 2)  + 0.01;
        this.pYAppleMesh2.position.z = apple.z * this.boxSize;

        this.pYAppleMesh2.rotation.x = Math.PI / 2;


    }
}