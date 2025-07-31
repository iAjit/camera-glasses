import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

const video = document.getElementById('video');

// Initialize camera
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => (video.onloadedmetadata = resolve));
}
await initCamera();

// Set up THREE.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 2);
scene.add(light);

// Load 3D Glasses model
let glassesModel;
const loader = new GLTFLoader();
loader.load('./assets/glasses.glb', (gltf) => {
  glassesModel = gltf.scene;
  glassesModel.scale.set(0.05, 0.05, 0.05);
  scene.add(glassesModel);
});

// MediaPipe: Use from global scope (from script tag)
const faceMesh = new window.FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

// MediaPipe camera
const mpCamera = new window.Camera(video, {
  onFrame: async () => await faceMesh.send({ image: video }),
  width: 640,
  height: 480
});
mpCamera.start();

// Face tracking handler
function onResults(results) {
  if (!glassesModel || results.multiFaceLandmarks.length === 0) return;
  const landmarks = results.multiFaceLandmarks[0];
  const left = landmarks[263];
  const right = landmarks[33];

  const centerX = (left.x + right.x) / 2;
  const centerY = (left.y + right.y) / 2;
  const centerZ = (left.z + right.z) / 2;

  glassesModel.position.set(
    (centerX - 0.5) * 2,
    -(centerY - 0.5) * 2,
    -centerZ - 1.5
  );

  const dx = (left.x - right.x);
  const dy = (left.y - right.y);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const scale = dist * 6;
  glassesModel.scale.set(scale, scale, scale);

  const angle = Math.atan2(dy, dx);
  glassesModel.rotation.set(0, 0, -angle);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
