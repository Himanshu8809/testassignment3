import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';


// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 8, 5);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
scene.add(ambientLight);


const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
planeMaterial.side = THREE.DoubleSide;
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);


const loader = new GLTFLoader();
let model;
let originalPosition;

loader.load(
  'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf', 
  (gltf) => {
    model = gltf.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.metalness = 0.5; 
      }
    });
    model.position.set(0, 0.9, 0);
    originalPosition = model.position.clone(); // Save home position
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error loading model:', error);
  }
);


const controls = new OrbitControls(camera, renderer.domElement);


document.getElementById('toggleShadows').addEventListener('click', () => {
  renderer.shadowMap.enabled = !renderer.shadowMap.enabled;

   
    model.traverse((child) => {
        if (child.isLight) {
          child.castShadow = renderer.shadowMap.enabled;
        }
        if (child.isMesh) {
          child.receiveShadow = renderer.shadowMap.enabled;
          child.castShadow = renderer.shadowMap.enabled;
        }
      });

      plane.receiveShadow =  renderer.shadowMap.enabled;
});


document.getElementById('applyColor').addEventListener('click', () => {
  const color = document.getElementById('colorPicker').value;
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.color.set(color);
      }
    });
  }
});

// Toggle Glossy Effect
document.getElementById('toggleGloss').addEventListener('click', () => {
  if (model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = child.material.metalness > 0 ? 0 : 0.9;
      }
    });
  }
});

// Return to Home Position
document.getElementById('homePosition').addEventListener('click', () => {
  if (model) {
    model.position.copy(originalPosition);
    model.rotation.set(0, 0, 0);

    camera.position.set(0, 2, 5);
    controls.target.copy(originalPosition); // Focus controls on the model's position
    controls.update(); 
  }
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
