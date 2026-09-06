/**
 * Aplikasi 3D Laboratorium Fisika Impian
 * Karya: Putri Intan Kania Nosa (NIM 2407015)
 * Engine: Three.js WebGL Renderer
 */

// ==================== GLOBAL STATE & VARIABLES ====================
let scene, camera, renderer, controls;
let clock = new THREE.Clock();
let animators = []; // Functions called in animation loop
let poiMarkers = []; // HTML Pin elements
let interactiveMeshes = []; // Raycastable 3D objects
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

// Lighting state
let ambientLight, sunLight, stageSpotLight, emergencyStrobe;
let ceilingLights = [];
let lightingMode = 'day'; // 'day', 'lab', 'presentation', 'night'
let isEmergencyActive = false;

// Audio Synthesizer State (Web Audio API)
let audioCtx = null;
let soundEnabled = true;
let ambientOscillator = null;

// Smartboard dynamic canvas texture
let smartboardTexture, smartboardCanvas, smartboardCtx;
let currentSimulationIndex = 0;
let simAnimationTime = 0;

// Camera Tween state
let cameraTween = null;

// Navigation mode: 'orbit' or 'fps'
let currentNavMode = 'orbit';
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let playerVelocity = new THREE.Vector3();
let playerDirection = new THREE.Vector3();
let isPointerLocked = false;

// Ceiling visibility toggle
let ceilingMesh = null;
let showPins = true;

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  initThree();
  buildLaboratoryScene();
  setupSmartBoardCanvas();
  create3DPOIPins();
  setupUIEventListeners();
  setupMinimap();
  animate();

  showToast("Selamat datang di Web 3D Desain Laboratorium Fisika Impian!");
});

// ==================== THREE.JS SETUP ====================
function initThree() {
  const container = document.getElementById('canvas-container');
  const width = window.innerWidth;
  const height = window.innerHeight;

  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f1d);
  scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 8.5, 11);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  // 4. OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below floor
  controls.minDistance = 1.5;
  controls.maxDistance = 25;
  controls.target.set(0, 1.2, 0);

  // Resize listener
  window.addEventListener('resize', onWindowResize);
  renderer.domElement.addEventListener('click', onCanvasClick);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ==================== LIGHTING SYSTEM ====================
function setupLighting() {
  // Ambient Light
  ambientLight = new THREE.AmbientLight(0xdbeafe, 0.45);
  scene.add(ambientLight);

  // Directional Sunlight (From left windows)
  sunLight = new THREE.DirectionalLight(0xfff7ed, 1.1);
  sunLight.position.set(-14, 10, -2);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 30;
  sunLight.shadow.camera.left = -9;
  sunLight.shadow.camera.right = 9;
  sunLight.shadow.camera.top = 9;
  sunLight.shadow.camera.bottom = -9;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Teacher Stage Spotlight
  stageSpotLight = new THREE.SpotLight(0xffffff, 1.2, 14, Math.PI / 4, 0.4, 1.2);
  stageSpotLight.position.set(-1, 3.6, -1);
  stageSpotLight.target.position.set(-1, 1, -4);
  scene.add(stageSpotLight);
  scene.add(stageSpotLight.target);

  // Ceiling Fluorescent LED Panels (Grid of 6 point/rect lights)
  const ceilingPositions = [
    [-3, 3.6, -2], [3, 3.6, -2],
    [-3, 3.6, 0.8], [3, 3.6, 0.8],
    [-3, 3.6, 3.2], [3, 3.6, 3.2]
  ];

  ceilingPositions.forEach(pos => {
    const light = new THREE.PointLight(0xf1f5f9, 0.65, 8, 1.5);
    light.position.set(pos[0], pos[1], pos[2]);
    scene.add(light);
    ceilingLights.push(light);

    // Visible light diffuser box on ceiling
    const fixtureGeo = new THREE.BoxGeometry(1.6, 0.08, 0.6);
    const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const fixture = new THREE.Mesh(fixtureGeo, fixtureMat);
    fixture.position.set(pos[0], 3.75, pos[2]);
    scene.add(fixture);
  });

  // Emergency Red Strobe in Room K3
  emergencyStrobe = new THREE.PointLight(0xef4444, 0, 10, 1);
  emergencyStrobe.position.set(-5.5, 3.2, 3.2);
  scene.add(emergencyStrobe);
}

function updateLightingMode(mode) {
  lightingMode = mode;
  const label = document.getElementById('lighting-text');

  if (mode === 'day') {
    label.innerText = 'Mode Siang';
    ambientLight.intensity = 0.55;
    ambientLight.color.setHex(0xdbeafe);
    sunLight.intensity = 1.15;
    sunLight.color.setHex(0xffedd5);
    ceilingLights.forEach(l => l.intensity = 0.4);
    stageSpotLight.intensity = 0.8;
    renderer.toneMappingExposure = 1.1;
  } else if (mode === 'lab') {
    label.innerText = 'Mode Lab Aktif';
    ambientLight.intensity = 0.7;
    ambientLight.color.setHex(0xffffff);
    sunLight.intensity = 0.5;
    ceilingLights.forEach(l => l.intensity = 0.95);
    stageSpotLight.intensity = 1.2;
    renderer.toneMappingExposure = 1.15;
  } else if (mode === 'presentation') {
    label.innerText = 'Mode Presentasi';
    ambientLight.intensity = 0.18;
    sunLight.intensity = 0.1;
    ceilingLights.forEach(l => l.intensity = 0.15);
    stageSpotLight.intensity = 1.6;
    renderer.toneMappingExposure = 0.95;
  } else if (mode === 'night') {
    label.innerText = 'Mode Malam';
    ambientLight.intensity = 0.1;
    ambientLight.color.setHex(0x1e1b4b);
    sunLight.intensity = 0.0;
    ceilingLights.forEach(l => l.intensity = 0.08);
    stageSpotLight.intensity = 0.4;
    renderer.toneMappingExposure = 0.85;
  }
}

// ==================== PROCEDURAL TEXTURES ====================
function createTileTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base tile color (clean ivory/light cream)
  ctx.fillStyle = '#ebe9e0';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle marble / speckle noise
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.03)';
    ctx.fillRect(x, y, 2, 2);
  }

  // Grout lines
  ctx.strokeStyle = '#c8c5b9';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, 512, 512);
  ctx.strokeRect(256, 0, 256, 512);
  ctx.strokeRect(0, 256, 512, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 8);
  return texture;
}

function createChalkboardTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep matte chalkboard green
  ctx.fillStyle = '#124126';
  ctx.fillRect(0, 0, 1024, 512);

  // Chalk smudges
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.beginPath();
    ctx.arc(Math.random() * 1024, Math.random() * 512, Math.random() * 100 + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Formulas written in chalk
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'bold 26px "Times New Roman", serif';
  ctx.fillText("HUKUM FISIKA & EKSPERIMEN", 50, 60);

  ctx.font = '22px "Times New Roman", serif';
  ctx.fillText("1. Dinamika: ΣF = m · a  |  Ek = ½ m v²", 50, 120);
  ctx.fillText("2. Gelombang: v = f · λ  |  T = 1 / f", 50, 170);
  ctx.fillText("3. Termodinamika: Q = m · c · ΔT  |  P·V = n·R·T", 50, 220);
  ctx.fillText("4. Listrik Magnet: V = I · R  |  F = q (E + v × B)", 50, 270);
  ctx.fillText("5. Optika Geometri: 1/f = 1/s + 1/s'", 50, 320);

  // Small coordinate vector diagram
  ctx.strokeStyle = '#86efac';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(850, 360); ctx.lineTo(850, 260); // Y
  ctx.moveTo(850, 360); ctx.lineTo(950, 360); // X
  ctx.moveTo(850, 360); ctx.lineTo(800, 420); // Z
  ctx.stroke();
  ctx.fillStyle = '#86efac';
  ctx.font = '16px monospace';
  ctx.fillText("y", 855, 265);
  ctx.fillText("x", 955, 365);
  ctx.fillText("z", 790, 425);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createTextSignTexture(text, bgColor = '#1e293b', textColor = '#38bdf8') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = textColor;
  ctx.font = 'bold 24px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 64);

  return new THREE.CanvasTexture(canvas);
}

// ==================== SMARTBOARD PHET SIMULATOR ====================
function setupSmartBoardCanvas() {
  smartboardCanvas = document.createElement('canvas');
  smartboardCanvas.width = 1024;
  smartboardCanvas.height = 640;
  smartboardCtx = smartboardCanvas.getContext('2d');
  smartboardTexture = new THREE.CanvasTexture(smartboardCanvas);

  renderSmartboardSimulation();
}

function renderSmartboardSimulation() {
  const ctx = smartboardCtx;
  const w = smartboardCanvas.width;
  const h = smartboardCanvas.height;
  const sim = SIMULATION_PRESETS[currentSimulationIndex];

  // Background UI
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Top header bar (PhET style)
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, w, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillText("⚛ PhET INTERACTIVE SIMULATIONS — Physics Lab", 24, 34);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(sim.badge, w - 24, 33);
  ctx.textAlign = 'left';

  // Content Area based on simulation
  ctx.save();
  ctx.translate(0, 50);

  if (sim.id === 'phet_waves') {
    // Wave ripple simulation
    ctx.fillStyle = '#021e38';
    ctx.fillRect(0, 0, w, h - 50);

    const cx = w / 2;
    const cy = (h - 50) / 2;
    for (let r = 20; r < 360; r += 26) {
      const alpha = Math.sin((r - simAnimationTime * 60) * 0.05) * 0.5 + 0.5;
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx - 100, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cx + 100, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (sim.id === 'newton_dynamics') {
    // Inclined plane mechanics
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, w, h - 50);

    // Incline wedge
    ctx.fillStyle = '#374151';
    ctx.beginPath();
    ctx.moveTo(150, 480);
    ctx.lineTo(750, 480);
    ctx.lineTo(750, 180);
    ctx.closePath();
    ctx.fill();

    // Sliding Cart
    const t = (simAnimationTime % 4) / 4;
    const cartX = 700 - t * 450;
    const cartY = 205 + t * 225;
    ctx.save();
    ctx.translate(cartX, cartY);
    ctx.rotate(0.46);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-40, -30, 80, 40);
    // Wheels
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-25, 12, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(25, 12, 8, 0, Math.PI * 2); ctx.fill();
    // Force Vector Arrow
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(-90, -10); ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText("F_g·sin(θ)", -90, -20);
    ctx.restore();
  } else if (sim.id === 'optics_ray') {
    // Triangular prism light dispersion
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h - 50);

    // Prism
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, 120);
    ctx.lineTo(w / 2 - 140, 440);
    ctx.lineTo(w / 2 + 140, 440);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Incident White Beam
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(80, 240); ctx.lineTo(w / 2 - 60, 260); ctx.stroke();

    // Dispersed rainbow beams
    const rainbow = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7'];
    rainbow.forEach((color, i) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2 + 50, 280 + i * 4);
      ctx.lineTo(w - 100, 180 + i * 42);
      ctx.stroke();
    });
  } else {
    // Oscilloscope circuit wave
    ctx.fillStyle = '#051910';
    ctx.fillRect(0, 0, w, h - 50);

    // Grid lines
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

    // Green oscilloscope trace
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const y = (h - 50) / 2 + Math.sin(x * 0.02 + simAnimationTime * 5) * 120 * Math.sin(x * 0.005);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Formula Overlay Card at Bottom
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(20, h - 140, w - 40, 70);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, h - 140, w - 40, 70);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 18px Outfit, sans-serif';
  ctx.fillText(sim.title, 40, h - 108);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 19px "Times New Roman", serif';
  ctx.fillText(sim.formula, 40, h - 84);

  ctx.restore();
  smartboardTexture.needsUpdate = true;
}

// ==================== BUILD 3D LABORATORY ====================
function buildLaboratoryScene() {
  setupLighting();

  const floorTex = createTileTexture();
  const chalkboardTex = createChalkboardTexture();

  // Materials
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: 0.25,
    metalness: 0.1
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.85,
    metalness: 0.02
  });

  const wallTrimMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x93c5fd,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.2
  });

  const tableTopMat = new THREE.MeshStandardMaterial({
    color: 0x14532d, // Physics dark green phenolic top
    roughness: 0.35,
    metalness: 0.15
  });

  const metalLegMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8
  });

  const woodOakMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.6,
    metalness: 0.05
  });

  // 1. FLOOR (15m x 10m)
  const floorGeo = new THREE.PlaneGeometry(15, 10);
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // 2. CEILING (Toggleable)
  const ceilingGeo = new THREE.PlaneGeometry(15, 10);
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceilingMesh.position.y = 3.8;
  ceilingMesh.rotation.x = Math.PI / 2;
  ceilingMesh.visible = false; // Hidden by default for bird's eye view
  scene.add(ceilingMesh);

  // 3. WALLS (Height: 3.8m)
  // Front Wall (Z = -5)
  const frontWall = new THREE.Mesh(new THREE.BoxGeometry(15, 3.8, 0.2), wallMat);
  frontWall.position.set(0, 1.9, -5.1);
  frontWall.receiveShadow = true;
  scene.add(frontWall);

  // Back Wall (Z = 5)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(15, 3.8, 0.2), wallMat);
  backWall.position.set(0, 1.9, 5.1);
  backWall.receiveShadow = true;
  scene.add(backWall);

  // Right Wall (X = 7.5)
  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 10), wallMat);
  rightWall.position.set(7.6, 1.9, 0);
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Left Wall (X = -7.5) with 3 Large Window Cutouts
  const leftWallSolid1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 2.0), wallMat);
  leftWallSolid1.position.set(-7.6, 1.9, -4.0);
  scene.add(leftWallSolid1);

  const leftWallSolid2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 2.5), wallMat);
  leftWallSolid2.position.set(-7.6, 1.9, 3.75);
  scene.add(leftWallSolid2);

  // Base sill & Header for windows
  const windowSill = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.0, 5.5), wallTrimMat);
  windowSill.position.set(-7.6, 0.5, -0.25);
  scene.add(windowSill);

  const windowHeader = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 5.5), wallTrimMat);
  windowHeader.position.set(-7.6, 3.5, -0.25);
  scene.add(windowHeader);

  // 3 Glass Window Panes
  for (let i = 0; i < 3; i++) {
    const glassPane = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.2, 1.6), glassMat);
    glassPane.position.set(-7.6, 2.1, -2.0 + i * 1.8);
    scene.add(glassPane);

    // Window frame border
    const frameGeo = new THREE.BoxGeometry(0.12, 2.2, 0.08);
    const frame1 = new THREE.Mesh(frameGeo, wallTrimMat);
    frame1.position.set(-7.6, 2.1, -2.8 + i * 1.8);
    scene.add(frame1);
    const frame2 = new THREE.Mesh(frameGeo, wallTrimMat);
    frame2.position.set(-7.6, 2.1, -1.2 + i * 1.8);
    scene.add(frame2);
  }

  // ==================== FRONT WALL: Panggung Guru & Smartboard ====================
  // Papan Tulis Hijau Besar
  const boardGeo = new THREE.BoxGeometry(4.2, 1.8, 0.05);
  const boardMat = new THREE.MeshStandardMaterial({ map: chalkboardTex, roughness: 0.6 });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(-1.8, 2.2, -4.96);
  scene.add(board);

  // Aluminum Frame for Chalkboard
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(4.3, 1.9, 0.02), frameMat);
  boardFrame.position.set(-1.8, 2.2, -4.98);
  scene.add(boardFrame);

  // Smart Board 75" Interactive Display
  const smartboardGeo = new THREE.BoxGeometry(2.4, 1.45, 0.06);
  const smartboardMat = new THREE.MeshBasicMaterial({ map: smartboardTexture });
  const smartboard = new THREE.Mesh(smartboardGeo, smartboardMat);
  smartboard.position.set(2.0, 2.2, -4.96);
  smartboard.userData = { isSmartboard: true };
  interactiveMeshes.push(smartboard);
  scene.add(smartboard);

  // Bezel for Smart Board
  const smartFrame = new THREE.Mesh(new THREE.BoxGeometry(2.48, 1.53, 0.04), frameMat);
  smartFrame.position.set(2.0, 2.2, -4.98);
  scene.add(smartFrame);

  // Teacher Podium Stage
  const stageGeo = new THREE.BoxGeometry(6.5, 0.15, 2.2);
  const stageMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
  const stage = new THREE.Mesh(stageGeo, stageMat);
  stage.position.set(-0.5, 0.075, -3.8);
  stage.receiveShadow = true;
  scene.add(stage);

  // Teacher Long Demonstration Table (Meja Demo Guru)
  const demoTableTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.08, 0.9), tableTopMat);
  demoTableTop.position.set(-1.5, 0.95, -3.5);
  demoTableTop.castShadow = true;
  demoTableTop.receiveShadow = true;
  scene.add(demoTableTop);

  const demoCabinet = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.85, 0.8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  demoCabinet.position.set(-1.5, 0.46, -3.5);
  demoCabinet.castShadow = true;
  scene.add(demoCabinet);

  // Chrome Faucet & Sink on Demo Table
  const sinkGeo = new THREE.BoxGeometry(0.5, 0.25, 0.45);
  const sinkMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.2 });
  const sink = new THREE.Mesh(sinkGeo, sinkMat);
  sink.position.set(-0.2, 0.9, -3.5);
  scene.add(sink);

  const faucetPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35), frameMat);
  faucetPipe.position.set(-0.2, 1.15, -3.65);
  scene.add(faucetPipe);

  // Teacher Desk (Wood Oak) & Executive Chair
  const teacherDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.75, 0.75), woodOakMat);
  teacherDesk.position.set(1.4, 0.45, -3.5);
  teacherDesk.castShadow = true;
  scene.add(teacherDesk);

  // Laptop on Teacher Desk
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), frameMat);
  laptopBase.position.set(1.4, 0.84, -3.5);
  scene.add(laptopBase);
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.02), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
  laptopScreen.position.set(1.4, 0.95, -3.62);
  laptopScreen.rotation.x = 0.2;
  scene.add(laptopScreen);

  // Teacher Chair
  buildChair(1.4, -4.2, 0x1e293b);

  // ==================== 5. RUANG GURU & LABORAN (Partisi Kaca) ====================
  // Enclosure at front-right (X: 3.8 to 7.5, Z: -5 to -2)
  const partitionGlass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.8, 0.08), glassMat);
  partitionGlass.position.set(5.6, 1.9, -2.2);
  scene.add(partitionGlass);

  const partitionDividing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.8, 2.8), glassMat);
  partitionDividing.position.set(3.8, 1.9, -3.6);
  scene.add(partitionDividing);

  // Door Opening frame for Laboran
  const labDoorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.3, 0.1), wallTrimMat);
  labDoorFrame.position.set(4.4, 1.15, -2.2);
  scene.add(labDoorFrame);

  // Desk & PC inside Laboran Room
  const labDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.75, 0.8), woodOakMat);
  labDesk.position.set(5.8, 0.38, -3.6);
  scene.add(labDesk);

  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.04), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
  monitor.position.set(5.8, 0.95, -3.8);
  scene.add(monitor);

  // Filing Cabinet
  const fileCabinet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.8, 0.55), frameMat);
  fileCabinet.position.set(6.9, 0.9, -4.4);
  scene.add(fileCabinet);

  // Sign: "RUANG GURU & LABORAN"
  const signLab = createTextSignTexture("RUANG GURU & LABORAN", "#0f172a", "#38bdf8");
  const signLabMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: signLab }));
  signLabMesh.position.set(5.8, 2.6, -2.15);
  scene.add(signLabMesh);

  // ==================== 6. RUANG KHUSUS KESELAMATAN (K3 & MEDIS) ====================
  // Dedicated room at rear-left (X: -7.5 to -3.8, Z: 2.2 to 5.0)
  const k3WallFront = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.8, 0.12), new THREE.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.6 }));
  k3WallFront.position.set(-5.6, 1.9, 2.2);
  scene.add(k3WallFront);

  const k3WallRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 2.8), new THREE.MeshStandardMaterial({ color: 0xfff1f2, roughness: 0.6 }));
  k3WallRight.position.set(-3.8, 1.9, 3.6);
  scene.add(k3WallRight);

  // Red accent border for safety room
  const k3Accent = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.12, 0.14), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
  k3Accent.position.set(-5.6, 3.7, 2.2);
  scene.add(k3Accent);

  // Sign: "RUANG K3 & MEDIS"
  const signK3 = createTextSignTexture("RUANG K3 & MEDIS", "#7f1d1d", "#ffffff");
  const signK3Mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: signK3 }));
  signK3Mesh.position.set(-5.2, 2.6, 2.13);
  scene.add(signK3Mesh);

  // Door opening into K3 room
  const k3Door = new THREE.Mesh(new THREE.BoxGeometry(0.95, 2.2, 0.05), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
  k3Door.position.set(-4.2, 1.1, 2.2);
  scene.add(k3Door);

  // Medical Cross on K3 Door
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  crossH.position.set(-4.2, 1.4, 2.21);
  scene.add(crossH);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.06), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  crossV.position.set(-4.2, 1.4, 2.21);
  scene.add(crossV);

  // Inside K3: Medical Examination Bed / Tandu Medis
  const medBedMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const medBed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.75), medBedMat);
  medBed.position.set(-5.5, 0.35, 4.0);
  medBed.castShadow = true;
  scene.add(medBed);

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.65), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
  pillow.position.set(-6.2, 0.64, 4.0);
  scene.add(pillow);

  // Emergency Eyewash & Safety Shower
  const showerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.4), frameMat);
  showerPole.position.set(-4.2, 1.5, 3.8);
  scene.add(showerPole);

  const showerHead = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.12, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  showerHead.position.set(-4.2, 2.7, 3.8);
  showerHead.rotation.x = Math.PI;
  scene.add(showerHead);

  const eyewashBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0xfacc15 }));
  eyewashBowl.position.set(-4.2, 1.1, 3.8);
  scene.add(eyewashBowl);

  // Tabung APAR (Fire Extinguisher)
  const aparBody = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.3 }));
  aparBody.position.set(-3.95, 1.2, 2.5);
  scene.add(aparBody);
  const aparNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.25), frameMat);
  aparNozzle.position.set(-3.95, 1.5, 2.5);
  scene.add(aparNozzle);

  // Selimut Api (Fire Blanket Cabinet)
  const fireBlanket = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.45, 0.08), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
  fireBlanket.position.set(-4.6, 1.3, 2.27);
  scene.add(fireBlanket);

  // First Aid Cabinet (Kotak P3K)
  const p3kBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
  p3kBox.position.set(-5.6, 1.6, 2.27);
  scene.add(p3kBox);
  const p3kCross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.13), new THREE.MeshBasicMaterial({ color: 0x16a34a }));
  p3kCross.position.set(-5.6, 1.6, 2.28);
  scene.add(p3kCross);

  // Master Emergency Cut-Off Switch (Saklar Sentral K3)
  const switchBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.12), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  switchBox.position.set(-6.4, 1.4, 2.27);
  scene.add(switchBox);

  // Big Red Mushroom Button
  const mushroomBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.08, 16), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  mushroomBtn.position.set(-6.4, 1.4, 2.34);
  mushroomBtn.rotation.x = Math.PI / 2;
  mushroomBtn.userData = { isEmergencyButton: true };
  interactiveMeshes.push(mushroomBtn);
  scene.add(mushroomBtn);

  // Yellow warning plate behind mushroom
  const warningPlate = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
  warningPlate.position.set(-6.4, 1.4, 2.33);
  scene.add(warningPlate);

  // ==================== DOORS: Main Entrance & Emergency Exit ====================
  // 1. Pintu Masuk Utama (X: -6.2, Z: -5.0)
  const entranceDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.3, 0.08), woodOakMat);
  entranceDoor.position.set(-6.2, 1.15, -4.96);
  scene.add(entranceDoor);
  const doorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.09), glassMat);
  doorGlass.position.set(-6.2, 1.4, -4.96);
  scene.add(doorGlass);

  // 2. Pintu Darurat (Emergency Exit) (X: -7.5, Z: 4.2)
  const exitDoor = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x15803d }));
  exitDoor.position.set(-7.56, 1.15, 4.2);
  scene.add(exitDoor);

  // Panic push bar
  const panicBar = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.9), frameMat);
  panicBar.position.set(-7.5, 1.1, 4.2);
  scene.add(panicBar);

  // Glowing Green EXIT Sign
  const exitSign = createTextSignTexture("EXIT ➔", "#14532d", "#86efac");
  const exitSignMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.25), new THREE.MeshBasicMaterial({ map: exitSign }));
  exitSignMesh.position.set(-7.48, 2.5, 4.2);
  exitSignMesh.rotation.y = Math.PI / 2;
  scene.add(exitSignMesh);

  // ==================== 7 & 8. MEJA PRAKTIKUM SISWA MODULAR ====================
  // 6 Unit Meja (2 Kolom x 3 Baris)
  const tableCols = [-2.0, 1.8];
  const tableRows = [-1.5, 0.5, 2.5];

  tableCols.forEach((tx, colIdx) => {
    tableRows.forEach((tz, rowIdx) => {
      buildStudentWorkbench(tx, tz, colIdx, rowIdx);
    });
  });

  // ==================== 9. AREA KOLABORASI & DISKUSI ====================
  // Round Table at X = 4.8, Z = 0.6
  const roundTableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 32), new THREE.MeshStandardMaterial({ color: 0x581c87, roughness: 0.4 }));
  roundTableTop.position.set(4.8, 0.8, 0.6);
  roundTableTop.castShadow = true;
  scene.add(roundTableTop);

  const roundTableLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.77, 16), frameMat);
  roundTableLeg.position.set(4.8, 0.4, 0.6);
  scene.add(roundTableLeg);

  const roundTableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 32), frameMat);
  roundTableBase.position.set(4.8, 0.02, 0.6);
  scene.add(roundTableBase);

  // 5 Breakout Chairs around round table
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const cx = 4.8 + Math.cos(angle) * 1.35;
    const cz = 0.6 + Math.sin(angle) * 1.35;
    buildComfortChair(cx, cz, angle);
  }

  // Mobile Whiteboard / Flipchart
  const flipchart = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.04), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
  flipchart.position.set(6.2, 1.2, 0.6);
  flipchart.rotation.y = -Math.PI / 4;
  scene.add(flipchart);

  // ==================== 10 & 11. AREA RISET MANDIRI & SIMULASI PhET ====================
  // Long counter along left wall (X = -6.8)
  const researchCounter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 3.8), tableTopMat);
  researchCounter.position.set(-6.8, 0.425, 0.0);
  researchCounter.castShadow = true;
  scene.add(researchCounter);

  // 10. Research Apparatus: Pendulum Stand & Optical Rail
  const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7), frameMat);
  standPole.position.set(-6.8, 1.2, -1.2);
  scene.add(standPole);

  const pendulumBob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
  pendulumBob.position.set(-6.7, 0.95, -1.2);
  scene.add(pendulumBob);

  // 11. PhET Digital Station: 2 Desktop PCs
  for (let p = 0; p < 2; p++) {
    const pcZ = 0.8 + p * 1.0;
    const pcScreen = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.55), new THREE.MeshBasicMaterial({ color: 0x0284c7 }));
    pcScreen.position.set(-6.8, 1.1, pcZ);
    scene.add(pcScreen);

    const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.4), frameMat);
    keyboard.position.set(-6.55, 0.86, pcZ);
    scene.add(keyboard);
  }

  // ==================== 12. AREA PERSIAPAN ALAT LABORAN ====================
  // Countertop at X = 6.2, Z = -1.8
  const prepCounter = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.85, 1.6), new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }));
  prepCounter.position.set(6.6, 0.425, -1.6);
  scene.add(prepCounter);

  // Apparatus Kit Trays
  for (let tr = 0; tr < 3; tr++) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.3), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    tray.position.set(6.5, 0.88 + tr * 0.07, -1.6);
    scene.add(tray);
  }

  // ==================== 21. AREA CUCI & SINK PERALATAN ====================
  // Stainless steel double sink at X = 6.8, Z = -0.5
  const washCounter = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 1.4), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.2 }));
  washCounter.position.set(6.8, 0.425, -0.5);
  scene.add(washCounter);

  // 2 Chrome Faucets
  const washFaucet1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), frameMat);
  washFaucet1.position.set(6.65, 1.0, -0.75);
  scene.add(washFaucet1);
  const washFaucet2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3), frameMat);
  washFaucet2.position.set(6.65, 1.0, -0.25);
  scene.add(washFaucet2);

  // ==================== 13, 14, 15, 16. LEMARI ALAT 4 BIDANG FISIKA ====================
  // Lemari 1: Mekanika & Termo (Back wall: X = -3.2, Z = 4.7)
  buildStorageCabinet(-3.2, 4.7, "LEMARI 1: MEKANIKA & TERMO", "#0284c7");

  // Lemari 3: Optik, Gelombang & Bunyi (Back wall: X = -0.5, Z = 4.7)
  buildStorageCabinet(-0.5, 4.7, "LEMARI 3: OPTIK & GELOMBANG", "#9333ea");

  // Lemari 4: Sensor & Neraca Presisi (Back wall: X = 2.2, Z = 4.7)
  buildStorageCabinet(2.2, 4.7, "LEMARI 4: SENSOR & ALAT PRESISI", "#10b981");

  // Lemari 2: Listrik, Magnet & Elektronika (Right wall: X = 6.8, Z = 2.8)
  buildStorageCabinet(6.8, 2.8, "LEMARI 2: LISTRIK & MAGNET", "#f59e0b", true);
}

// Helper: Build Student Workbench with Chairs and Experiments
function buildStudentWorkbench(x, z, colIdx, rowIdx) {
  const tableGroup = new THREE.Group();
  tableGroup.position.set(x, 0, z);

  // Table Top (2.4m x 1.1m)
  const topGeo = new THREE.BoxGeometry(2.4, 0.08, 1.1);
  const topMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.35 });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = 0.85;
  top.castShadow = true;
  top.receiveShadow = true;
  tableGroup.add(top);

  // Table Legs (4 Heavy duty steel tubes)
  const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.81);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
  const legPositions = [
    [-1.05, 0.405, -0.45], [1.05, 0.405, -0.45],
    [-1.05, 0.405, 0.45], [1.05, 0.405, 0.45]
  ];
  legPositions.forEach(lp => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lp[0], lp[1], lp[2]);
    tableGroup.add(leg);
  });

  // Center Pop-up Socket Tower
  const socketGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08);
  const socketMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7 });
  const socket = new THREE.Mesh(socketGeo, socketMat);
  socket.position.set(0, 0.93, 0);
  tableGroup.add(socket);

  // Different physics experiment setup per table
  const expIdx = colIdx * 3 + rowIdx;
  if (expIdx === 0) {
    // Optical Bench with Red Laser
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.03, 0.06), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    rail.position.set(0, 0.91, 0.2);
    tableGroup.add(rail);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    laser.position.set(-0.5, 0.94, 0.2);
    tableGroup.add(laser);
  } else if (expIdx === 1) {
    // Dynamics Cart & Track
    const track = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: 0x64748b }));
    track.position.set(0, 0.90, -0.15);
    tableGroup.add(track);
    const cart = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.1), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    cart.position.set(0.2, 0.94, -0.15);
    tableGroup.add(cart);
  } else if (expIdx === 2) {
    // Multimeter & Circuit Board
    const breadboard = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.18), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
    breadboard.position.set(-0.3, 0.90, 0.15);
    tableGroup.add(breadboard);
    const dmm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.18), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    dmm.position.set(0.3, 0.91, 0.15);
    tableGroup.add(dmm);
  } else if (expIdx === 3) {
    // Calorimeter & Beaker
    const calorimeter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
    calorimeter.position.set(0, 0.97, 0.2);
    tableGroup.add(calorimeter);
  } else if (expIdx === 4) {
    // Spring Oscillation Stand
    const springPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    springPole.position.set(-0.4, 1.14, -0.2);
    tableGroup.add(springPole);
  } else {
    // Tuning Fork on Wooden Box
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.1), woodOakMat);
    box.position.set(0, 0.93, 0);
    tableGroup.add(box);
  }

  // 4 Ergonomic Swivel Stools around each table
  const stoolOffsets = [
    [-0.7, 0.75], [0.7, 0.75],
    [-0.7, -0.75], [0.7, -0.75]
  ];
  stoolOffsets.forEach(so => {
    buildLabStool(x + so[0], z + so[1]);
  });

  scene.add(tableGroup);
}

// Helper: Build Ergonomic Lab Stool
function buildLabStool(x, z) {
  const stoolGroup = new THREE.Group();
  stoolGroup.position.set(x, 0, z);

  // Five star base center
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
  base.position.y = 0.08;
  stoolGroup.add(base);

  // Stem
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.45), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
  stem.position.y = 0.3;
  stoolGroup.add(stem);

  // Seat
  const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }));
  seat.position.y = 0.53;
  stoolGroup.add(seat);

  // Ergonomic curved backrest
  const backPole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.28), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
  backPole.position.set(0, 0.67, -0.16);
  stoolGroup.add(backPole);

  const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.03), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
  backrest.position.set(0, 0.78, -0.16);
  stoolGroup.add(backrest);

  scene.add(stoolGroup);
}

// Helper: Simple Office Chair
function buildChair(x, z, color = 0x1e293b) {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), new THREE.MeshStandardMaterial({ color }));
  seat.position.y = 0.45;
  chair.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.08), new THREE.MeshStandardMaterial({ color }));
  back.position.set(0, 0.72, -0.22);
  chair.add(back);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), new THREE.MeshStandardMaterial({ color: 0x64748b }));
  stem.position.y = 0.2;
  chair.add(stem);

  scene.add(chair);
}

// Helper: Comfort Breakout Chair
function buildComfortChair(x, z, angle) {
  const chair = new THREE.Group();
  chair.position.set(x, 0, z);
  chair.rotation.y = angle + Math.PI;

  const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.45), new THREE.MeshStandardMaterial({ color: 0x7e22ce, roughness: 0.6 }));
  cushion.position.y = 0.44;
  chair.add(cushion);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.06), new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.6 }));
  back.position.set(0, 0.64, -0.2);
  chair.add(back);

  const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
  const lp = [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]];
  lp.forEach(p => {
    const l = new THREE.Mesh(legGeo, legMat);
    l.position.set(p[0], 0.2, p[1]);
    chair.add(l);
  });

  scene.add(chair);
}

// Helper: Storage Cabinets (Lemari Alat Berlabel)
function buildStorageCabinet(x, z, labelText, accentColor, isSideWall = false) {
  const cabinet = new THREE.Group();
  cabinet.position.set(x, 0, z);
  if (isSideWall) cabinet.rotation.y = -Math.PI / 2;

  // Main wooden / steel housing
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.3, 0.6), new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.7 }));
  body.position.y = 1.15;
  body.castShadow = true;
  cabinet.add(body);

  // Glass Windows
  const glassGeo = new THREE.PlaneGeometry(0.7, 1.4);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.4, roughness: 0.1 });
  const g1 = new THREE.Mesh(glassGeo, glassMat);
  g1.position.set(-0.42, 1.25, 0.31);
  cabinet.add(g1);
  const g2 = new THREE.Mesh(glassGeo, glassMat);
  g2.position.set(0.42, 1.25, 0.31);
  cabinet.add(g2);

  // Illuminated Cabinet Label Header
  const labelTex = createTextSignTexture(labelText, "#1c1917", accentColor);
  const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.35), new THREE.MeshBasicMaterial({ map: labelTex }));
  labelMesh.position.set(0, 2.15, 0.31);
  cabinet.add(labelMesh);

  // Shelves inside
  for (let s = 0; s < 3; s++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.03, 0.5), new THREE.MeshStandardMaterial({ color: 0x44403c }));
    shelf.position.set(0, 0.7 + s * 0.45, 0);
    cabinet.add(shelf);
  }

  scene.add(cabinet);
}

// ==================== 3D FLOATING PIN BADGES ====================
function create3DPOIPins() {
  const overlay = document.getElementById('pins-overlay');
  overlay.innerHTML = '';
  poiMarkers = [];

  LAB_POINTS_OF_INTEREST.forEach(poi => {
    const pinEl = document.createElement('div');
    pinEl.className = 'pin-label';
    if (poi.category === "Keselamatan & K3") pinEl.classList.add('danger');
    pinEl.innerHTML = `
      <span>${poi.id}</span>
      <div class="pin-tooltip">${poi.name}</div>
    `;

    pinEl.addEventListener('click', (e) => {
      e.stopPropagation();
      selectPOI(poi);
    });

    overlay.appendChild(pinEl);

    poiMarkers.push({
      element: pinEl,
      poi: poi,
      pos3D: new THREE.Vector3(...poi.position)
    });
  });
}

function update3DPins() {
  if (!showPins) {
    poiMarkers.forEach(m => m.element.style.display = 'none');
    return;
  }

  const widthHalf = window.innerWidth / 2;
  const heightHalf = window.innerHeight / 2;
  const tempV = new THREE.Vector3();

  poiMarkers.forEach(marker => {
    tempV.copy(marker.pos3D);
    tempV.project(camera);

    // Is pin in front of camera?
    if (tempV.z < 1) {
      const x = (tempV.x * widthHalf) + widthHalf;
      const y = -(tempV.y * heightHalf) + heightHalf;
      marker.element.style.display = 'flex';
      marker.element.style.left = `${x}px`;
      marker.element.style.top = `${y}px`;
    } else {
      marker.element.style.display = 'none';
    }
  });
}

function selectPOI(poi) {
  playTone(520, 0.08);

  // Highlight active pin
  poiMarkers.forEach(m => {
    if (m.poi.id === poi.id) m.element.classList.add('active');
    else m.element.classList.remove('active');
  });

  // Populate Side Drawer
  document.getElementById('poi-category').innerText = poi.category;
  document.getElementById('poi-title').innerText = poi.name;
  document.getElementById('poi-desc').innerText = poi.description;

  const featureList = document.getElementById('poi-features');
  featureList.innerHTML = '';
  poi.features.forEach(f => {
    const li = document.createElement('li');
    li.innerText = f;
    featureList.appendChild(li);
  });

  document.getElementById('poi-standard').innerText = poi.standard;

  // Open Drawer
  const drawer = document.getElementById('poi-drawer');
  drawer.classList.add('open');

  // Smooth Camera transition toward POI
  flyCameraTo(poi.cameraPos, poi.cameraTarget);
}

// ==================== CAMERA ANIMATION & PRESETS ====================
function flyCameraTo(targetPos, targetLookAt, duration = 1200) {
  if (currentNavMode === 'fps') {
    switchNavMode('orbit');
  }

  const startPos = camera.position.clone();
  const startLookAt = controls.target.clone();
  const endPos = new THREE.Vector3(...targetPos);
  const endLookAt = new THREE.Vector3(...targetLookAt);

  const startTime = performance.now();

  cameraTween = {
    update: () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // EaseInOutCubic
      const t = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPos, endPos, t);
      controls.target.lerpVectors(startLookAt, endLookAt, t);
      controls.update();

      if (progress >= 1) {
        cameraTween = null;
      }
    }
  };
}

function applyPreset(presetName) {
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-preset') === presetName);
  });

  playTone(440, 0.06);

  switch (presetName) {
    case 'overview':
      flyCameraTo([0, 8.5, 11], [0, 1.2, 0]);
      break;
    case 'top':
      // Direct Top-Down 2D Denah
      flyCameraTo([0, 15, 0.01], [0, 0, 0]);
      break;
    case 'front':
      // Front Teacher Stage View
      flyCameraTo([0, 2.2, 2.5], [-0.5, 1.8, -4.8]);
      break;
    case 'students':
      // Student Workbenches View
      flyCameraTo([-1.8, 3.2, 4.5], [-0.5, 0.9, 0.5]);
      break;
    case 'k3':
      // Inside Room K3 & Medis
      flyCameraTo([-3.2, 2.0, 2.4], [-5.5, 1.2, 3.8]);
      break;
    case 'cabinets':
      // Storage Cabinets View
      flyCameraTo([0, 2.4, 1.2], [0, 1.6, 4.8]);
      break;
    case 'research':
      // Left Wall Independent Research & PhET
      flyCameraTo([-4.0, 2.0, 0.0], [-6.8, 1.2, 0.0]);
      break;
    case 'collab':
      // Collaboration Round Table
      flyCameraTo([2.8, 2.0, 0.6], [4.8, 0.9, 0.6]);
      break;
  }
}

// ==================== INTERACTIVE ACTIONS ====================
function toggleEmergencyCutOff() {
  isEmergencyActive = !isEmergencyActive;
  const btnText = document.getElementById('emergency-text');
  const alarmOverlay = document.getElementById('alarm-overlay');

  if (isEmergencyActive) {
    btnText.innerText = "Saklar K3: DARURAT";
    alarmOverlay.classList.add('flashing');
    emergencyStrobe.intensity = 2.5;

    // Cut general ceiling lighting
    ceilingLights.forEach(l => l.intensity = 0.05);
    stageSpotLight.intensity = 0.1;
    ambientLight.color.setHex(0x7f1d1d);
    ambientLight.intensity = 0.25;

    playAlarmSound();
    showToast("⚠️ SAKLAR PEMUTUS K3 DITEKAN! Aliran listrik praktikum diputus seketika!");
  } else {
    btnText.innerText = "Saklar K3: AKTIF";
    alarmOverlay.classList.remove('flashing');
    emergencyStrobe.intensity = 0;

    updateLightingMode(lightingMode);
    playTone(330, 0.2);
    showToast("✓ Daya listrik laboratorium dipulihkan normal.");
  }
}

function nextSmartBoardSimulation() {
  currentSimulationIndex = (currentSimulationIndex + 1) % SIMULATION_PRESETS.length;
  renderSmartboardSimulation();
  playTone(660, 0.08);
  showToast(`Simulasi: ${SIMULATION_PRESETS[currentSimulationIndex].title}`);
}

function onCanvasClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(interactiveMeshes);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData.isEmergencyButton) {
      toggleEmergencyCutOff();
    } else if (obj.userData.isSmartboard) {
      nextSmartBoardSimulation();
    }
  }
}

// ==================== NAVIGATION MODE SWITCH (ORBIT / FPS) ====================
function setupUIEventListeners() {
  // Preset chips
  document.querySelectorAll('.preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.getAttribute('data-preset'));
    });
  });

  // Lighting mode switcher
  const lightingModes = ['day', 'lab', 'presentation', 'night'];
  document.getElementById('btn-lighting').addEventListener('click', () => {
    const nextIdx = (lightingModes.indexOf(lightingMode) + 1) % lightingModes.length;
    updateLightingMode(lightingModes[nextIdx]);
    playTone(550, 0.05);
  });

  // Smart Board switcher
  document.getElementById('btn-smartboard').addEventListener('click', nextSmartBoardSimulation);

  // Emergency Button
  document.getElementById('btn-emergency').addEventListener('click', toggleEmergencyCutOff);

  // Sound FX Toggle
  document.getElementById('btn-sound').addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    document.getElementById('sound-icon').innerText = soundEnabled ? '🔊' : '🔇';
    showToast(soundEnabled ? "Suara diaktifkan." : "Suara dimatikan.");
  });

  // Concept Modal
  const modal = document.getElementById('info-modal');
  document.getElementById('btn-info-modal').addEventListener('click', () => {
    modal.classList.add('open');
    playTone(400, 0.05);
  });
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    modal.classList.remove('open');
  });

  // POI Drawer Close
  document.getElementById('btn-close-drawer').addEventListener('click', () => {
    document.getElementById('poi-drawer').classList.remove('open');
    poiMarkers.forEach(m => m.element.classList.remove('active'));
  });

  // Drawer Focus Closer
  document.getElementById('btn-focus-poi').addEventListener('click', () => {
    const activeMarker = poiMarkers.find(m => m.element.classList.contains('active'));
    if (activeMarker) {
      flyCameraTo(
        [activeMarker.poi.cameraTarget[0], activeMarker.poi.cameraTarget[1] + 0.6, activeMarker.poi.cameraTarget[2] + 1.2],
        activeMarker.poi.cameraTarget,
        800
      );
    }
  });

  // Quick Toggles
  document.getElementById('btn-toggle-pins').addEventListener('click', function() {
    showPins = !showPins;
    this.classList.toggle('active', showPins);
    this.querySelector('.toggle-status').innerText = showPins ? 'ON' : 'OFF';
  });

  document.getElementById('btn-toggle-roof').addEventListener('click', function() {
    if (ceilingMesh) {
      ceilingMesh.visible = !ceilingMesh.visible;
      this.classList.toggle('active', ceilingMesh.visible);
      this.querySelector('.toggle-status').innerText = ceilingMesh.visible ? 'ON' : 'OFF';
    }
  });

  document.getElementById('btn-auto-rotate').addEventListener('click', function() {
    controls.autoRotate = !controls.autoRotate;
    controls.autoRotateSpeed = 1.0;
    this.classList.toggle('active', controls.autoRotate);
    this.querySelector('.toggle-status').innerText = controls.autoRotate ? 'ON' : 'OFF';
  });

  document.getElementById('btn-reset-view').addEventListener('click', () => {
    applyPreset('overview');
  });

  // Nav Mode Toggle
  document.getElementById('nav-mode-orbit').addEventListener('click', () => switchNavMode('orbit'));
  document.getElementById('nav-mode-fps').addEventListener('click', () => switchNavMode('fps'));

  // FPS Guide Modal
  document.getElementById('btn-start-fps').addEventListener('click', () => {
    document.getElementById('fps-guide').classList.remove('active');
    document.body.requestPointerLock();
  });

  // Keyboard navigation for FPS
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mousemove', onMouseMoveFPS);
}

function switchNavMode(mode) {
  currentNavMode = mode;
  document.getElementById('nav-mode-orbit').classList.toggle('active', mode === 'orbit');
  document.getElementById('nav-mode-fps').classList.toggle('active', mode === 'fps');

  const crosshair = document.getElementById('crosshair');

  if (mode === 'fps') {
    controls.enabled = false;
    crosshair.style.display = 'block';
    document.getElementById('fps-guide').classList.add('active');
    // Position inside room at eye level
    camera.position.set(-5.5, 1.65, -3.5); // Near entrance door
    camera.lookAt(0, 1.65, 0);
  } else {
    controls.enabled = true;
    crosshair.style.display = 'none';
    document.getElementById('fps-guide').classList.remove('active');
    if (document.pointerLockElement) document.exitPointerLock();
  }
}

function onPointerLockChange() {
  isPointerLocked = document.pointerLockElement === document.body;
}

function onMouseMoveFPS(event) {
  if (!isPointerLocked || currentNavMode !== 'fps') return;

  const movementX = event.movementX || 0;
  const movementY = event.movementY || 0;

  // Yaw & Pitch
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  euler.setFromQuaternion(camera.quaternion);

  euler.y -= movementX * 0.0025;
  euler.x -= movementY * 0.0025;
  euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, euler.x));

  camera.quaternion.setFromEuler(euler);
}

function onKeyDown(e) {
  if (currentNavMode !== 'fps') return;
  if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = true;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = true;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = true;
  if (e.code === 'Escape') switchNavMode('orbit');
}

function onKeyUp(e) {
  if (e.code === 'KeyW' || e.code === 'ArrowUp') moveForward = false;
  if (e.code === 'KeyS' || e.code === 'ArrowDown') moveBackward = false;
  if (e.code === 'KeyA' || e.code === 'ArrowLeft') moveLeft = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') moveRight = false;
}

function updateFPSMovement(delta) {
  if (currentNavMode !== 'fps') return;

  playerVelocity.x -= playerVelocity.x * 10.0 * delta;
  playerVelocity.z -= playerVelocity.z * 10.0 * delta;

  playerDirection.z = Number(moveForward) - Number(moveBackward);
  playerDirection.x = Number(moveRight) - Number(moveLeft);
  playerDirection.normalize();

  const speed = 24.0;
  if (moveForward || moveBackward) playerVelocity.z -= playerDirection.z * speed * delta;
  if (moveLeft || moveRight) playerVelocity.x -= playerDirection.x * speed * delta;

  const moveVector = new THREE.Vector3();
  moveVector.setFromMatrixColumn(camera.matrix, 0); // Camera right
  moveVector.y = 0;
  moveVector.normalize();
  moveVector.multiplyScalar(-playerVelocity.x * delta);

  const forwardVector = new THREE.Vector3();
  forwardVector.setFromMatrixColumn(camera.matrix, 2); // Camera forward
  forwardVector.y = 0;
  forwardVector.normalize();
  forwardVector.multiplyScalar(-playerVelocity.z * delta);

  camera.position.add(moveVector);
  camera.position.add(forwardVector);

  // Boundary clamp inside room
  camera.position.x = Math.max(-7.0, Math.min(7.0, camera.position.x));
  camera.position.z = Math.max(-4.5, Math.min(4.5, camera.position.z));
  camera.position.y = 1.65; // Eye height
}

// ==================== 2D MINIMAP RADAR ====================
let minimapCanvas, minimapCtx;
function setupMinimap() {
  minimapCanvas = document.getElementById('minimap-canvas');
  if (!minimapCanvas) return;
  minimapCtx = minimapCanvas.getContext('2d');
}

function updateMinimap() {
  if (!minimapCtx) return;
  const ctx = minimapCtx;
  const w = minimapCanvas.width;
  const h = minimapCanvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background grid
  ctx.fillStyle = '#0a101d';
  ctx.fillRect(0, 0, w, h);

  // Transform coordinates: Lab (X: -7.5 to 7.5, Z: -5 to 5) -> Minimap (W: 160, H: 110)
  const mapX = (x) => ((x + 7.5) / 15) * (w - 20) + 10;
  const mapZ = (z) => ((z + 5.0) / 10) * (h - 20) + 10;

  // Walls outline
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(mapX(-7.5), mapZ(-5.0), mapX(7.5) - mapX(-7.5), mapZ(5.0) - mapZ(-5.0));

  // Teacher stage
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(mapX(-3.5), mapZ(-4.8), mapX(3.5) - mapX(-3.5), 14);

  // Ruang Guru (top right)
  ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
  ctx.strokeStyle = '#64748b';
  ctx.fillRect(mapX(3.8), mapZ(-5.0), mapX(7.5) - mapX(3.8), mapZ(-2.2) - mapZ(-5.0));
  ctx.strokeRect(mapX(3.8), mapZ(-5.0), mapX(7.5) - mapX(3.8), mapZ(-2.2) - mapZ(-5.0));

  // Ruang K3 (bottom left)
  ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
  ctx.strokeStyle = '#dc2626';
  ctx.fillRect(mapX(-7.5), mapZ(2.2), mapX(-3.8) - mapX(-7.5), mapZ(5.0) - mapZ(2.2));
  ctx.strokeRect(mapX(-7.5), mapZ(2.2), mapX(-3.8) - mapX(-7.5), mapZ(5.0) - mapZ(2.2));

  // 6 Student Workbenches
  ctx.fillStyle = '#15803d';
  const tableCols = [-2.0, 1.8];
  const tableRows = [-1.5, 0.5, 2.5];
  tableCols.forEach(tx => {
    tableRows.forEach(tz => {
      ctx.fillRect(mapX(tx - 1.1), mapZ(tz - 0.4), 22, 10);
    });
  });

  // Collaboration round table
  ctx.fillStyle = '#7e22ce';
  ctx.beginPath();
  ctx.arc(mapX(4.8), mapZ(0.6), 8, 0, Math.PI * 2);
  ctx.fill();

  // User position marker (Blinking Cyan)
  const userX = mapX(camera.position.x);
  const userZ = mapZ(camera.position.z);

  // Viewing direction cone
  const camDir = new THREE.Vector3();
  camera.getWorldDirection(camDir);
  const angle = Math.atan2(camDir.z, camDir.x);

  ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.beginPath();
  ctx.moveTo(userX, userZ);
  ctx.arc(userX, userZ, 18, angle - 0.4, angle + 0.4);
  ctx.closePath();
  ctx.fill();

  // Dot
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(userX, userZ, 4, 0, Math.PI * 2);
  ctx.fill();

  // Update text coordinates
  const coordLabel = document.getElementById('pos-coords');
  if (coordLabel) {
    coordLabel.innerText = `(${camera.position.x.toFixed(1)}, ${camera.position.z.toFixed(1)})`;
  }
}

// ==================== WEB AUDIO API SYNTHESIZER ====================
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq = 440, duration = 0.1, type = 'sine') {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playAlarmSound() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {}
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==================== MAIN ANIMATION LOOP ====================
function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  simAnimationTime += delta;

  // 1. Camera Tween
  if (cameraTween) {
    cameraTween.update();
  }

  // 2. Navigation controls
  if (currentNavMode === 'orbit') {
    controls.update();
  } else {
    updateFPSMovement(delta);
  }

  // 3. Update 3D Floating Pin Badges
  update3DPins();

  // 4. Update Smartboard PhET Canvas Texture
  renderSmartboardSimulation();

  // 5. Update Minimap Radar
  updateMinimap();

  // 6. Emergency Strobe Flicker
  if (isEmergencyActive) {
    emergencyStrobe.intensity = Math.sin(simAnimationTime * 12) > 0 ? 3.0 : 0.2;
  }

  // 7. Render
  renderer.render(scene, camera);
}
