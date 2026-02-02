// Mobile nav toggle
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#navMenu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking a link (mobile)
  menu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// Current year in footer
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());

// Campfire Glowing Effect
const glowWrappers = document.querySelectorAll('.glow-wrapper');

glowWrappers.forEach(wrapper => {
  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    wrapper.style.setProperty('--mouse-x', `${x}px`);
    wrapper.style.setProperty('--mouse-y', `${y}px`);
  });
  
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.setProperty('--mouse-x', '50%');
    wrapper.style.setProperty('--mouse-y', '50%');
  });
});

// Three.js 3D Model Viewer
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('sword-canvas');
if (canvas) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 1, 3);

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    alpha: true 
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Bright lighting to clearly see the model
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);
  
  // Add rim light for better model visibility
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
  rimLight.position.set(-5, 3, -5);
  scene.add(rimLight);

  // Orbit controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.0;
  controls.enableZoom = true;
  controls.enablePan = false;

  // Load GLB model
  const loader = new GLTFLoader();
  let model;

  loader.load(
    'assets/DarkSwordFinal.glb',
    (gltf) => {
      model = gltf.scene;
      
      // Ensure emissive materials are properly rendered
      model.traverse((child) => {
        if (child.isMesh) {
          if (child.material.emissive) {
            child.material.emissiveIntensity = 1.0;
          }
          child.material.needsUpdate = true;
        }
      });

      // Center and scale model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;
      model.scale.multiplyScalar(scale);
      
      model.position.x = -center.x * scale;
      model.position.y = -center.y * scale;
      model.position.z = -center.z * scale;

      scene.add(model);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    (error) => {
      console.error('Error loading model:', error);
    }
  );

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
}
