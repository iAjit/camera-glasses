import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const video = document.getElementById('video');

// Init camera
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: 640, height: 480 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => video.onloadedmetadata = resolve);
}
await initCamera();

// THREE.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 1, 2);
scene.add(light);

// Load GLB glasses
let glassesModel;
const loader = new GLTFLoader();
loader.load('./assets/glasses.glb', (gltf) => {
  glassesModel = gltf.scene;
  glassesModel.scale.set(0.05, 0.05, 0.05); // Adjust as needed
  scene.add(glassesModel);
});

// FaceMesh
const faceMesh = new FaceMesh({
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
const mpCamera = new Camera(video, {
  onFrame: async () => await faceMesh.send({ image: video }),
  width: 640,
  height: 480
});
mpCamera.start();

function onResults(results) {
  if (!glassesModel || results.multiFaceLandmarks.length === 0) return;

  const landmarks = results.multiFaceLandmarks[0];
  const left = landmarks[263];
  const right = landmarks[33];
  const center = landmarks[168];

  // Compute position (center between eyes)
  const x = (left.x + right.x) / 2;
  const y = (left.y + right.y) / 2;
  const z = (left.z + right.z) / 2;

  // Adjust position (closer to camera and center aligned)
  glassesModel.position.set(
    (x - 0.5) * 2,         // X: normalize -1 to 1
    -(y - 0.5) * 2,        // Y: invert and normalize
    -z - 1.5               // Z: depth
  );

  // Calculate scale based on eye distance
  const dx = (left.x - right.x);
  const dy = (left.y - right.y);
  const eyeDist = Math.sqrt(dx * dx + dy * dy);
  const scale = eyeDist * 6;
  glassesModel.scale.set(scale, scale, scale);

  // Optional: rotation
  const angleZ = Math.atan2(dy, dx);
  glassesModel.rotation.set(0, 0, -angleZ);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
