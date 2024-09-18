import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Crear el LoadingManager
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
    document.getElementById('loading-screen').style.display = 'flex';
};

loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    document.getElementById('loading-bar-progress').style.width = progress + '%';
};

loadingManager.onLoad = function () {
    document.getElementById('loading-screen').style.display = 'none';
};

loadingManager.onError = function (url) {
    console.error('Error al cargar ' + url);
};

// Escena
const sceneOne = new THREE.Scene();
sceneOne.background = new THREE.Color(0xfefefe);  // Fondo blanco

// Cámara
const cameraOne = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
cameraOne.position.set(0, 5, 20);  // Ajustar la posición de la cámara para ver mejor el cubo desde lejos

const directionalLightOne = new THREE.DirectionalLight(0xffffff, 1);
directionalLightOne.position.set(10, 10, 10);
sceneOne.add(directionalLightOne);

// Renderizador
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Crear un elemento de video en HTML
const video = document.createElement('video');
video.src = 'videos/small.mp4';  // Asegúrate de que la ruta sea correcta
video.muted = true;  // Opcional: silenciar el video
video.loop = true;  // Hacer que el video se repita
video.play();  // Iniciar el video

// Crear la textura del video
const videoTexture = new THREE.VideoTexture(video);

// Crear el cargador GLTF
const gltfLoader = new GLTFLoader(loadingManager);

// Definir la variable 'cube' de manera global
let cube;

// Cargar el archivo GLTF desde la subcarpeta 'models'
gltfLoader.load(
    'models/cube.gltf',  // Ruta a tu archivo GLTF
    function (gltf) {
        cube = gltf.scene;

        // Recorrer todos los nodos del modelo y verificar si tiene mallas y materiales
        cube.traverse((child) => {
            if (child.isMesh) {
                
                // Aplicar la textura del video a la cara frontal (supongamos que es la primera cara)
                const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
                
                // Si el material es un array, entonces hay varias caras
                if (Array.isArray(child.material)) {
                    child.material[0] = videoMaterial;  // Aplica la textura de video a la cara frontal (índice 0)
                } else {
                    // Si es un solo material, lo reemplazamos por el material de video
                    child.material = videoMaterial;
                }
            }
        });

        // Escala del cubo
        cube.scale.set(1, 1, 1);  // Ajustar la escala según sea necesario

        // Centrar el cubo en la escena
        cube.position.set(0, 0, 0);

        // Añadir el cubo a la escena
        sceneOne.add(cube);

        // Mostrar en la consola la estructura completa del modelo
        console.log("Estructura del modelo GLTF:", gltf);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% cargado');
    },
    function (error) {
        console.error('Error al cargar el modelo GLTF', error);
    }
);

// Iluminación
const ambientLight = new THREE.AmbientLight(0xfefefe, 0.5);  // Luz ambiental
sceneOne.add(ambientLight);

const pointLight = new THREE.PointLight(0xfefefe, 1);
pointLight.position.set(5, 5, 5);
sceneOne.add(pointLight);

// Controles de la cámara
const controls = new OrbitControls(cameraOne, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;

// Animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();

    renderer.render(sceneOne, cameraOne);
}

// Ajuste de la ventana
window.addEventListener('resize', () => {
    cameraOne.aspect = window.innerWidth / window.innerHeight;
    cameraOne.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.getElementById('loading-screen').style.display = 'flex';

// Iniciar la animación
animate();
