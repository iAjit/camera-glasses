import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';

const video = document.getElementById('video');

// Setup webcam
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => (video.onloadedmetadata = resolve));
}
await initCamera();

// Setup Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 2);
scene.add(light);

// Load glasses model
let glassesModel;
const loader = new GLTFLoader();
loader.load('./assets/glasses.glb', (gltf) => {
  glassesModel = gltf.scene;
  glassesModel.scale.set(0.05, 0.05, 0.05);
  scene.add(glassesModel);
});

// MediaPipe FaceMesh from window object
const faceMesh = new window.FaceMesh({
  locateFile: (file) =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults);

// Camera for FaceMesh
const mpCamera = new window.Camera(video, {
  onFrame: async () => {
    await faceMesh.send({ image: video });
  },
  width: 640,
  height: 480,
});
mpCamera.start();

// Update glasses on landmarks
function onResults(results) {
  if (!glassesModel || results.multiFaceLandmarks.length === 0) return;
  const landmarks = results.multiFaceLandmarks[0];
  const leftEye = landmarks[263];
  const rightEye = landmarks[33];

  const centerX = (leftEye.x + rightEye.x) / 2;
  const centerY = (leftEye.y + rightEye.y) / 2;
  const centerZ = (leftEye.z + rightEye.z) / 2;

  glassesModel.position.set(
    (centerX - 0.5) * 2,
    -(centerY - 0.5) * 2,
    -centerZ - 1.5
  );

  const dx = leftEye.x - rightEye.x;
  const dy = leftEye.y - rightEye.y;
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
