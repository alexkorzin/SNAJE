import * as THREE from 'three';

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
export function createParticles(boxSize, worldSize, speed) {
    let particleMaterial = new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.9, color: 0xfffffff });

    // Create Particles
    let particleGeometry = new THREE.BoxGeometry(boxSize / 15, boxSize / 15, boxSize / 15);
    let particleMesh = new THREE.Mesh(particleGeometry, particleMaterial);

    particleMesh.position.x = getRandomArbitrary(-worldSize / 2, worldSize / 2);
    particleMesh.position.y = getRandomArbitrary(-worldSize / 2, worldSize / 2);
    particleMesh.position.z = getRandomArbitrary(0, worldSize);

    particleMesh.vx = (0.5 - Math.random() + 0.1) / 30 * (speed || 0.5);
    particleMesh.vy = (0.5 - Math.random() + 0.1) / 30 * (speed || 0.5);
    particleMesh.vz = (0.5 - Math.random() + 0.1) / 30 * (speed || 0.5);

    return particleMesh;
}
export function moveParticles(particles, worldSize) {
    particles.forEach(particle => {
        particle.position.x += particle.vx;
        particle.position.y += particle.vy;
        particle.position.z += particle.vz;

        if (particle.position.x < -worldSize / 2 || particle.position.x > worldSize / 2) {
            particle.vx = -particle.vx;
        }

        if (particle.position.y < -worldSize / 2 || particle.position.y > worldSize / 2) {
            particle.vy = -particle.vy;
        }

        if (particle.position.z < 0 || particle.position.z > worldSize) {
            particle.vz = -particle.vz;
        }
    })
}