// main.js
import * as THREE from 'three';
import CSG from './libs/csg/three-csg.js';

// Crear la escena
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfefefe);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Crear un video como textura
const video = document.createElement('video');
video.src = 'videos/small.mp4';  // Asegúrate de proporcionar la ruta correcta a tu video
video.load();
video.muted = true;
video.addEventListener('canplay', () => {
    video.play();
});

const videoTexture = new THREE.VideoTexture(video);
videoTexture.wrapS = THREE.ClampToEdgeWrapping;
videoTexture.wrapT = THREE.ClampToEdgeWrapping;
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

// Crear un material que use la textura de video
const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide // Para que el video sea visible desde ambos lados del plano
});


// Crear un cubo
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeCrystalClearGeometry = new THREE.BoxGeometry(2, 2, 2);
// Crear un CubeCamera para las reflexiones
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
    format: THREE.RGBFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter
});
const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);
const material = new THREE.MeshNormalMaterial();
const crystalClearMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,  
    roughness: 0.1,
    transmission: 1, // Add transparency
    transparent: true,
    thickness: 0.1, // Add refraction
    reflectivity: 1,
    ior: 1.3,
    side: THREE.DoubleSide,

});
const crystalSideMaterial = new THREE.MeshPhysicalMaterial({
    envMap: cubeRenderTarget.texture, 
    envMapIntensity: 1,
    metalness: 0.1,  
    roughness: 0.1,
    transmission: 0.9, // Add transparency
    thickness: 0, // Add refraction
    reflectivity: 0.9,
    refractionRatio: 0.1, // Efecto de refracción
    ior: 1.3,
    sheen: 1, // Simular efectos de dispersión de luz
    sheenColor: new THREE.Color(0xff0000), // Efecto prismático con un color inicial
    side: THREE.DoubleSide,

});
const backFaceMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 1,  
    roughness: 1,
    transmission: 0,
    transparent: false
}); // Material para la cara del fondo
// Crear un array de materiales, con el material cristalino para todas las caras excepto la trasera
const materialsArray = [
    crystalSideMaterial, // Cara 1
    crystalSideMaterial, // Cara 2
    crystalSideMaterial, // Cara 3
    crystalSideMaterial, // Cara 4
    crystalClearMaterial, // Cara 5
    backFaceMaterial      // Cara 6 (trasera)
];
const cube = new THREE.Mesh(cubeGeometry, material);
const cubeCrystalClear = new THREE.Mesh(cubeCrystalClearGeometry, materialsArray);
cube.position.set(0, 0, 0);
cubeCrystalClear.position.set(0,0,0);

// Crear una esfera que será restada del cubo
const sphereGeometry = new THREE.SphereGeometry(0.75, 32, 32);
const smallerSphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, material);
const smallerSphere = new THREE.Mesh(smallerSphereGeometry, material);
sphere.position.set(0.5, 0.5, 0.5);  // Ajustar la posición para que interseque con el cubo
smallerSphere.position.set(0, 0, 0);  // Ajustar la posición para que interseque con el cubo

const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshNormalMaterial();
const planeOne = new THREE.Mesh(planeGeometry, videoMaterial);


// Crear el grupo para contener el cubo y el plano
const cubeGroup = new THREE.Group();

// Añadir el cubo y el plano al grupo
cubeGroup.add(cubeCrystalClear);
cubeGroup.add(planeOne);

// Ajustar la posición del plano para que esté en la cara trasera del cubo
planeOne.position.set(0, 0, -1);  // Ajusta la posición Z para que coincida con la cara trasera del cubo


// Añadir las geometrías a la escena (para visualización antes del corte)
//scene.add(cube);
//scene.add(sphere);
//scene.add(smallerSphere);
scene.add(cubeGroup);

// Crear las representaciones CSG
const cubeCSG = CSG.fromMesh(cube);
const sphereCSG = CSG.fromMesh(sphere);
const smallerSphereCSG = CSG.fromMesh(smallerSphere);

// Realizar la operación de sustracción
const firstSubtractedCSG = cubeCSG.subtract(smallerSphereCSG);
const secondSubtractedCSG = cubeCSG.subtract(sphereCSG);

// Convertir el resultado de vuelta a una malla de Three.js
const resultMesh = CSG.toMesh(secondSubtractedCSG, new THREE.Matrix4(), material);

// Limpiar la escena y añadir la malla resultante
// scene.remove(cube);
// scene.remove(sphere);
// scene.add(resultMesh);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xfefefe, 0.5);  // Luz ambiental
scene.add(ambientLight);

const pointLightOne = new THREE.PointLight(0xdde3e6, 1);
const pointLightTwo = new THREE.PointLight(0xdde3e6, 1);
const pointLightThree = new THREE.PointLight(0xdde3e6, 1);
pointLightOne.position.set(-5, 5, 5);
pointLightTwo.position.set(0, 5, 5);
pointLightThree.position.set(5, 5, 5);
scene.add(pointLightOne);
scene.add(pointLightTwo);
scene.add(pointLightThree);

let target = new THREE.Vector3();
let mouseX = 0, mouseY = 0; // Usamos let porque los valores se actualizarán
let speed = 0.2; // 0.02

const windowHalfX = window.innerWidth / 2; // Usamos const porque este valor no cambiará
const windowHalfY = window.innerHeight / 2;

// Listen for mouse movement
document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) / windowHalfX;
    mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

// Renderizado
function animate() {
    requestAnimationFrame(animate);

    resultMesh.rotation.x += 0.01;
    resultMesh.rotation.y += 0.01;

    // Update target position based on mouse
    target.x += (mouseX - target.x) * speed;
    target.y += (-mouseY - target.y) * speed;
    target.z = camera.position.z; // Keep the Z consistent with the camera position

    // Make the object look at the target
    cubeGroup.lookAt(target);

    cubeCrystalClear.visible = false;  // Hacer invisible el cubo para evitar reflejos de sí mismo
    cubeCamera.position.copy(cubeCrystalClear.position);
    cubeCamera.update(renderer, scene);
    cubeCrystalClear.visible = true;  // Volver a hacerlo visible

    renderer.render(scene, camera);
}
animate();