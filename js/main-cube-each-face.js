import * as THREE from 'three';

// 1. Crear la escena, cámara y renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. Crear el cubo original
const originalGeometry = new THREE.BoxGeometry(1, 1, 1);

// 3. Clonar y modificar la geometría para truncar los vértices
const truncatedGeometry = originalGeometry.clone();

// Obtener el atributo de posición
const positionAttribute = truncatedGeometry.attributes.position;
const vertex = new THREE.Vector3();

// Iterar sobre cada vértice y moverlo hacia el centro en un 10%
for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);
    // Mover el vértice un 10% hacia el centro
    vertex.multiplyScalar(0.9);
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
}

// Actualizar los atributos
truncatedGeometry.attributes.position.needsUpdate = true;
truncatedGeometry.computeVertexNormals();

// 4. Crear el material y la malla
const material = new THREE.MeshNormalMaterial({ flatShading: true });
const truncatedCube = new THREE.Mesh(truncatedGeometry, material);
scene.add(truncatedCube);

// 5. Posicionar la cámara
camera.position.z = 3;

// 6. Añadir iluminación (opcional, pero recomendado para ver mejor las caras truncadas)
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// 7. Animar la escena
function animate() {
    requestAnimationFrame(animate);
    truncatedCube.rotation.x += 0.01;
    truncatedCube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();

// 8. Manejar el redimensionamiento de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
