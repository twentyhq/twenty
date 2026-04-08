import {
  VIRTUAL_RENDER_HEIGHT,
  blurFragmentShader,
  halftoneFragmentShader,
  passThroughVertexShader,
} from './rendering';
import type {
  HalftoneGeometrySpec,
  HalftoneStudioSettings,
} from './types';

const GEOMETRY_RUNTIME_SOURCE = String.raw`
function makePolarShape(radiusFunction, segments = 320) {
  const shape = new THREE.Shape();

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = (segmentIndex / segments) * Math.PI * 2;
    const radius = radiusFunction(angle);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    if (segmentIndex === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }

  return shape;
}

function makeReliefGeometry(shape, options = {}) {
  const {
    bevelSegments = 8,
    bevelSize = 0.08,
    bevelThickness = 0.1,
    depth = 0.58,
    waveDepth = 0.016,
    waves = 8,
  } = options;

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 2,
    bevelEnabled: true,
    bevelThickness,
    bevelSize,
    bevelSegments,
    curveSegments: 96,
  });

  geometry.center();

  const position = geometry.attributes.position;
  let maxRadius = 0;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
    maxRadius = Math.max(
      maxRadius,
      Math.hypot(position.getX(vertexIndex), position.getY(vertexIndex)),
    );
  }

  const fullDepth = depth + bevelThickness * 2;

  for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += 1) {
    const x = position.getX(vertexIndex);
    const y = position.getY(vertexIndex);
    const z = position.getZ(vertexIndex);
    const radius = Math.hypot(x, y) / maxRadius;
    const angle = Math.atan2(y, x);
    const faceAmount = Math.min(1, Math.abs(z) / (fullDepth * 0.5));
    const rimLift = Math.exp(-Math.pow((radius - 0.84) / 0.12, 2));
    const innerDish = Math.exp(-Math.pow((radius - 0.42) / 0.2, 2));
    const wave =
      Math.cos(angle * waves) *
      Math.exp(-Math.pow((radius - 0.72) / 0.16, 2)) *
      waveDepth;
    const relief = faceAmount * (0.14 * rimLift - 0.055 * innerDish + wave);

    position.setZ(vertexIndex, z + (z >= 0 ? 1 : -1) * relief);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function mergeGeometries(geometries) {
  if (geometries.length === 1) {
    return geometries[0];
  }

  let totalVertices = 0;
  let totalIndices = 0;
  let hasUv = false;

  const geometryInfos = geometries.map((geometry) => {
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv ?? null;
    const index = geometry.index;
    const indexCount = index ? index.count : position.count;

    totalVertices += position.count;
    totalIndices += indexCount;
    hasUv = hasUv || uv !== null;

    return {
      index,
      indexCount,
      normal,
      position,
      uv,
      vertexCount: position.count,
    };
  });

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const uvs = hasUv ? new Float32Array(totalVertices * 2) : null;
  const indices = new Uint32Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const geometryInfo of geometryInfos) {
    for (let vertexIndex = 0; vertexIndex < geometryInfo.vertexCount; vertexIndex += 1) {
      const positionOffset = (vertexOffset + vertexIndex) * 3;
      positions[positionOffset] = geometryInfo.position.getX(vertexIndex);
      positions[positionOffset + 1] = geometryInfo.position.getY(vertexIndex);
      positions[positionOffset + 2] = geometryInfo.position.getZ(vertexIndex);
      normals[positionOffset] = geometryInfo.normal.getX(vertexIndex);
      normals[positionOffset + 1] = geometryInfo.normal.getY(vertexIndex);
      normals[positionOffset + 2] = geometryInfo.normal.getZ(vertexIndex);

      if (uvs !== null) {
        const uvOffset = (vertexOffset + vertexIndex) * 2;
        uvs[uvOffset] = geometryInfo.uv?.getX(vertexIndex) ?? 0;
        uvs[uvOffset + 1] = geometryInfo.uv?.getY(vertexIndex) ?? 0;
      }
    }

    if (geometryInfo.index) {
      for (let localIndex = 0; localIndex < geometryInfo.indexCount; localIndex += 1) {
        indices[indexOffset + localIndex] =
          geometryInfo.index.getX(localIndex) + vertexOffset;
      }
    } else {
      for (let localIndex = 0; localIndex < geometryInfo.indexCount; localIndex += 1) {
        indices[indexOffset + localIndex] = localIndex + vertexOffset;
      }
    }

    vertexOffset += geometryInfo.vertexCount;
    indexOffset += geometryInfo.indexCount;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

  if (uvs !== null) {
    merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  merged.setIndex(new THREE.BufferAttribute(indices, 1));

  return merged;
}

function makeArrowTarget() {
  const targetParts = [];
  const arrowParts = [];
  const baseRadius = 1.35;
  const baseDepth = 0.32;
  const bevel = 0.12;
  const points = [];
  const segments = 16;

  points.push(new THREE.Vector2(0, -baseDepth / 2));
  points.push(new THREE.Vector2(baseRadius - bevel, -baseDepth / 2));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = Math.PI / 2 + (segmentIndex / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        -baseDepth / 2 + bevel + Math.sin(angle) * bevel,
      ),
    );
  }

  points.push(new THREE.Vector2(baseRadius, baseDepth / 2 - bevel));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = (segmentIndex / segments) * (Math.PI / 2);
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        baseDepth / 2 - bevel + Math.sin(angle) * bevel,
      ),
    );
  }

  points.push(new THREE.Vector2(0, baseDepth / 2));

  const disc = new THREE.LatheGeometry(points, 64);
  disc.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  targetParts.push(disc);

  for (const radius of [0.45, 0.85, 1.22]) {
    const ring = new THREE.TorusGeometry(radius, 0.14, 16, 64);
    ring.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 + 0.04),
    );
    targetParts.push(ring);
  }

  const bump = new THREE.SphereGeometry(0.32, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2);
  bump.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  bump.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2));
  targetParts.push(bump);

  const shaftLength = 1.5;
  const shaftRadius = 0.05;
  const shaft = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftLength, 10, 1);
  shaft.applyMatrix4(new THREE.Matrix4().makeTranslation(0, shaftLength / 2, 0));
  arrowParts.push(shaft);

  const head = new THREE.ConeGeometry(0.12, 0.35, 10);
  head.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.15, 0));
  arrowParts.push(head);

  for (let finIndex = 0; finIndex < 3; finIndex += 1) {
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.22, 0.25);
    finShape.lineTo(0, 0.5);
    finShape.lineTo(0, 0);

    const finGeometry = new THREE.ExtrudeGeometry(finShape, {
      depth: 0.012,
      bevelEnabled: false,
    });

    finGeometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0.05, 0, -0.006));
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeRotationY((finIndex * Math.PI * 2) / 3),
    );
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, shaftLength - 0.45, 0),
    );
    arrowParts.push(finGeometry);
  }

  const nock = new THREE.SphereGeometry(0.065, 8, 8);
  nock.applyMatrix4(new THREE.Matrix4().makeTranslation(0, shaftLength + 0.03, 0));
  arrowParts.push(nock);

  const aim = new THREE.Matrix4().makeRotationX(Math.PI / 2.15);
  const tilt = new THREE.Matrix4().makeRotationZ(Math.PI / 5);
  const shift = new THREE.Matrix4().makeTranslation(0.15, 0.15, 0.12);

  for (const geometry of arrowParts) {
    geometry.applyMatrix4(aim);
    geometry.applyMatrix4(tilt);
    geometry.applyMatrix4(shift);
  }

  const merged = mergeGeometries([...targetParts, ...arrowParts]);
  merged.computeVertexNormals();
  merged.computeBoundingSphere();

  return merged;
}

function makeDollarCoin() {
  const parts = [];
  const baseRadius = 1.3;
  const baseDepth = 0.45;
  const bevel = 0.18;
  const points = [];
  const segments = 20;

  points.push(new THREE.Vector2(0, -baseDepth / 2));
  points.push(new THREE.Vector2(baseRadius - bevel, -baseDepth / 2));

  for (let segmentIndex = 0; segmentIndex <= segments; segmentIndex += 1) {
    const angle = -Math.PI / 2 + (segmentIndex / segments) * Math.PI;
    points.push(
      new THREE.Vector2(
        baseRadius - bevel + Math.cos(angle) * bevel,
        Math.sin(angle) * (baseDepth / 2),
      ),
    );
  }

  points.push(new THREE.Vector2(baseRadius - bevel, baseDepth / 2));
  points.push(new THREE.Vector2(0, baseDepth / 2));

  const disc = new THREE.LatheGeometry(points, 64);
  disc.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  parts.push(disc);

  const frontRim = new THREE.TorusGeometry(baseRadius - 0.22, 0.05, 12, 64);
  frontRim.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 - 0.01),
  );
  parts.push(frontRim);

  const backRim = new THREE.TorusGeometry(baseRadius - 0.22, 0.05, 12, 64);
  backRim.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, 0, -(baseDepth / 2 - 0.01)),
  );
  parts.push(backRim);

  const createDollarSign = () => {
    const geometries = [];
    const tubeRadius = 0.1;
    const curveRadius = 0.28;
    const verticalOffset = 0.22;

    const bar = new THREE.CylinderGeometry(0.05, 0.05, 1.3, 12);
    geometries.push(bar);

    const topArc = new THREE.TorusGeometry(curveRadius, tubeRadius, 16, 32, Math.PI);
    topArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.05, verticalOffset, 0),
    );
    geometries.push(topArc);

    const bottomArc = new THREE.TorusGeometry(curveRadius, tubeRadius, 16, 32, Math.PI);
    bottomArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    bottomArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-0.05, -verticalOffset, 0),
    );
    geometries.push(bottomArc);

    const topSerif = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.22, 12);
    topSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.16, verticalOffset + curveRadius, 0),
    );
    geometries.push(topSerif);

    const bottomSerif = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.22, 12);
    bottomSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    bottomSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-0.16, -verticalOffset - curveRadius, 0),
    );
    geometries.push(bottomSerif);

    const diagonalLength = Math.sqrt(0.1 * 0.1 + (verticalOffset * 2) ** 2);
    const diagonalAngle = Math.atan2(verticalOffset * 2, 0.1);
    const diagonal = new THREE.CylinderGeometry(tubeRadius, tubeRadius, diagonalLength + 0.12, 12);
    diagonal.applyMatrix4(
      new THREE.Matrix4().makeRotationZ(diagonalAngle - Math.PI / 2),
    );
    geometries.push(diagonal);

    return geometries;
  };

  for (const geometry of createDollarSign()) {
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2 + 0.01),
    );
    parts.push(geometry);
  }

  for (const geometry of createDollarSign()) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI));
    geometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, 0, -(baseDepth / 2 + 0.01)),
    );
    parts.push(geometry);
  }

  const merged = mergeGeometries(parts);
  merged.computeVertexNormals();
  merged.computeBoundingSphere();

  return merged;
}

function createBuiltinGeometry(shapeKey) {
  switch (shapeKey) {
    case 'torusKnot':
      return new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
    case 'sphere':
      return new THREE.SphereGeometry(1.4, 64, 64);
    case 'torus':
      return new THREE.TorusGeometry(1, 0.45, 64, 100);
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(1.4, 4);
    case 'box':
      return new THREE.BoxGeometry(2.1, 2.1, 2.1, 6, 6, 6);
    case 'cone':
      return new THREE.ConeGeometry(1.2, 2.4, 64, 10);
    case 'cylinder':
      return new THREE.CylinderGeometry(1, 1, 2.3, 64, 10);
    case 'octahedron':
      return new THREE.OctahedronGeometry(1.5, 2);
    case 'dodecahedron':
      return new THREE.DodecahedronGeometry(1.35, 1);
    case 'tetrahedron':
      return new THREE.TetrahedronGeometry(1.7, 1);
    case 'sunCoin':
      return makeReliefGeometry(
        makePolarShape(
          (angle) => 1 + 0.17 * Math.pow(0.5 + 0.5 * Math.cos(angle * 12), 1.5),
        ),
        { depth: 0.62, waves: 12, waveDepth: 0.018 },
      );
    case 'lotusCoin':
      return makeReliefGeometry(
        makePolarShape((angle) => 0.88 + 0.3 * Math.pow(Math.sin(angle * 4), 2)),
        { depth: 0.64, waves: 8, waveDepth: 0.014 },
      );
    case 'arrowTarget':
      return makeArrowTarget();
    case 'dollarCoin':
      return makeDollarCoin();
    default:
      return new THREE.TorusKnotGeometry(1, 0.35, 200, 32);
  }
}
`;

const IMPORTED_RUNTIME_SOURCE = String.raw`
const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );
  return loadingManager;
}

function normalizeImportedGeometry(geometry) {
  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  const dimensions = [size.x, size.y, size.z];
  const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));

  if (thinnestAxis === 0) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
  } else if (thinnestAxis === 1) {
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const radius = geometry.boundingSphere?.radius || 1;
  const scale = 1.6 / radius;
  geometry.scale(scale, scale, scale);

  geometry.computeBoundingBox();
  boundingBox = geometry.boundingBox;
  center = new THREE.Vector3();
  boundingBox?.getCenter(center);
  geometry.translate(-center.x, -center.y, -center.z);

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

function extractMergedGeometry(root, emptyMessage) {
  root.updateMatrixWorld(true);
  const geometries = [];

  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || !object.geometry) {
      return;
    }

    const geometry = object.geometry.clone();

    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    geometry.applyMatrix4(object.matrixWorld);
    geometries.push(geometry);
  });

  if (geometries.length === 0) {
    throw new Error(emptyMessage);
  }

  return normalizeImportedGeometry(mergeGeometries(geometries));
}

function parseFbxGeometry(buffer, label) {
  const originalWarn = console.warn;

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.FBXLoader:')) {
      return;
    }

    originalWarn(...args);
  };

  try {
    const root = new FBXLoader(createLoadingManager()).parse(buffer, '');
    return extractMergedGeometry(root, label + ' did not contain any mesh geometry.');
  } finally {
    console.warn = originalWarn;
  }
}

function parseGlbGeometry(buffer, label) {
  return new Promise((resolve, reject) => {
    new GLTFLoader(createLoadingManager()).parse(
      buffer,
      '',
      (gltf) => {
        try {
          resolve(
            extractMergedGeometry(
              gltf.scene,
              label + ' did not contain any mesh geometry.',
            ),
          );
        } catch (error) {
          reject(error);
        }
      },
      reject,
    );
  });
}

async function loadImportedGeometryFromUrl(loader, modelUrl, label) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error('Unable to load ' + label + ' from ' + modelUrl + '.');
  }

  const buffer = await response.arrayBuffer();

  if (loader === 'fbx') {
    return parseFbxGeometry(buffer, label);
  }

  return parseGlbGeometry(buffer, label);
}
`;

type ExportedShapeDescriptor = {
  filename: string | null;
  key: string;
  kind: HalftoneGeometrySpec['kind'];
  label: string;
  loader: HalftoneGeometrySpec['loader'] | null;
};

function createShapeDescriptor(
  shape: HalftoneGeometrySpec | undefined,
  settings: HalftoneStudioSettings,
): ExportedShapeDescriptor {
  if (!shape) {
    return {
      filename: null,
      key: settings.shapeKey,
      kind: 'builtin',
      label: settings.shapeKey,
      loader: null,
    };
  }

  return {
    filename: shape.filename ?? null,
    key: shape.key,
    kind: shape.kind,
    label: shape.label,
    loader: shape.loader ?? null,
  };
}

function serializeRuntimeSource(settings: HalftoneStudioSettings, shape: ExportedShapeDescriptor) {
  return `
const settings = ${JSON.stringify(settings, null, 2)};
const shape = ${JSON.stringify(shape, null, 2)};
const VIRTUAL_RENDER_HEIGHT = ${VIRTUAL_RENDER_HEIGHT};
const passThroughVertexShader = ${JSON.stringify(passThroughVertexShader)};
const blurFragmentShader = ${JSON.stringify(blurFragmentShader)};
const halftoneFragmentShader = ${JSON.stringify(halftoneFragmentShader)};

${GEOMETRY_RUNTIME_SOURCE}

${IMPORTED_RUNTIME_SOURCE}

function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState() {
  return {
    autoElapsed: 0,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    velocityX: 0,
    velocityY: 0,
  };
}

function resetInteractionState(interactionState, mode) {
  interactionState.dragging = false;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;

  if (mode === 'autoRotate') {
    interactionState.autoElapsed = 0;
  }
}

async function createGeometry(modelUrl) {
  if (shape.kind === 'imported' && shape.loader && modelUrl) {
    return loadImportedGeometryFromUrl(shape.loader, modelUrl, shape.label);
  }

  return createBuiltinGeometry(shape.key);
}
`;
}

function createMountScript() {
  return `
async function mountHalftoneCanvas(options) {
  const {
    container,
    modelUrl,
    onError,
  } = options;

  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );

  let geometry;

  try {
    geometry = await createGeometry(modelUrl);
  } catch (error) {
    onError?.(error);
    geometry = createBuiltinGeometry('torusKnot');
  }

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = 'grab';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  const scene3d = new THREE.Scene();
  scene3d.background = null;

  const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
  camera.position.z = 4;

  const primaryLight = new THREE.DirectionalLight(0xffffff, settings.lighting.intensity);
  const lightAngle = (settings.lighting.angleDegrees * Math.PI) / 180;
  primaryLight.position.set(
    Math.cos(lightAngle) * 5,
    settings.lighting.height,
    Math.sin(lightAngle) * 5,
  );
  scene3d.add(primaryLight);

  const fillLight = new THREE.DirectionalLight(
    0xffffff,
    settings.lighting.fillIntensity,
  );
  fillLight.position.set(-3, -1, 1);
  scene3d.add(fillLight);

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    settings.lighting.ambientIntensity,
  );
  scene3d.add(ambientLight);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xd4d0c8,
    roughness: settings.material.roughness,
    metalness: settings.material.metalness,
    envMap: environmentTexture,
    envMapIntensity: 0.25,
    clearcoat: 0,
    clearcoatRoughness: 0.08,
    reflectivity: 0.5,
    transmission: 0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene3d.add(mesh);

  const sceneTarget = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetA = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const blurTargetB = createRenderTarget(getVirtualWidth(), getVirtualHeight());
  const fullScreenGeometry = new THREE.PlaneGeometry(2, 2);
  const orthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const blurHorizontalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(1, 0) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const blurVerticalMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tInput: { value: null },
      dir: { value: new THREE.Vector2(0, 1) },
      res: { value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()) },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: blurFragmentShader,
  });

  const halftoneMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      tScene: { value: sceneTarget.texture },
      tGlow: { value: blurTargetB.texture },
      resolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      numRows: { value: settings.halftone.numRows },
      glowStr: { value: 0 },
      contrast: { value: settings.halftone.contrast },
      power: { value: settings.halftone.power },
      shading: { value: settings.halftone.shading },
      baseInk: { value: settings.halftone.baseInk },
      maxBar: { value: settings.halftone.maxBar },
      cellRatio: { value: settings.halftone.cellRatio },
      cutoff: { value: settings.halftone.cutoff },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      time: { value: 0 },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: halftoneFragmentShader,
  });

  const blurHorizontalScene = new THREE.Scene();
  blurHorizontalScene.add(
    new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial),
  );

  const blurVerticalScene = new THREE.Scene();
  blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));

  const interaction = createInteractionState();
  let animationMode = settings.animation.mode;
  let rotateEnabled = settings.animation.rotateEnabled;

  const syncSize = () => {
    const width = getWidth();
    const height = getHeight();
    const virtualWidth = getVirtualWidth();
    const virtualHeight = getVirtualHeight();

    renderer.setSize(virtualWidth, virtualHeight, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    sceneTarget.setSize(virtualWidth, virtualHeight);
    blurTargetA.setSize(virtualWidth, virtualHeight);
    blurTargetB.setSize(virtualWidth, virtualHeight);
    blurHorizontalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    blurVerticalMaterial.uniforms.res.value.set(virtualWidth, virtualHeight);
    halftoneMaterial.uniforms.resolution.value.set(virtualWidth, virtualHeight);
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const handlePointerDown = (event) => {
    interaction.dragging = true;
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    canvas.style.cursor = 'grabbing';
  };

  const handlePointerMove = (event) => {
    interaction.mouseX = event.clientX / window.innerWidth;
    interaction.mouseY = event.clientY / window.innerHeight;

    if (
      !interaction.dragging ||
      (animationMode !== 'followDrag' && animationMode !== 'autoRotate')
    ) {
      return;
    }

    const deltaX = (event.clientX - interaction.pointerX) * settings.animation.dragSens;
    const deltaY = (event.clientY - interaction.pointerY) * settings.animation.dragSens;
    interaction.velocityX = deltaY;
    interaction.velocityY = deltaX;
    interaction.targetRotationY += deltaX;
    interaction.targetRotationX += deltaY;
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
  };

  const handlePointerUp = () => {
    interaction.dragging = false;
    canvas.style.cursor = 'grab';
  };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointerdown', handlePointerDown);

  const clock = new THREE.Clock();
  let animationFrameId = 0;

  const renderFrame = () => {
    animationFrameId = window.requestAnimationFrame(renderFrame);

    const delta = 1 / 60;
    const elapsedTime = clock.getElapsedTime();
    halftoneMaterial.uniforms.time.value = elapsedTime;

    let baseRotationX = 0;
    let baseRotationY = 0;
    let baseRotationZ = 0;

    if (animationMode === 'autoRotate') {
      if (!interaction.dragging) {
        interaction.autoElapsed += delta;
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 0.92;
        interaction.velocityY *= 0.92;
      }

      baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
      baseRotationX += Math.sin(interaction.autoElapsed * 0.2) * settings.animation.autoWobble;
    }

    if (rotateEnabled) {
      interaction.rotateElapsed += delta;
      const rotateAngle = settings.animation.rotatePingPong
        ? Math.sin(interaction.rotateElapsed * settings.animation.rotateSpeed) * Math.PI
        : interaction.rotateElapsed * settings.animation.rotateSpeed;

      if (settings.animation.rotateAxis === 'x' || settings.animation.rotateAxis === 'xy') {
        baseRotationX += rotateAngle;
      }

      if (settings.animation.rotateAxis === 'y' || settings.animation.rotateAxis === 'xy') {
        baseRotationY += rotateAngle;
      }

      if (settings.animation.rotateAxis === 'z') {
        baseRotationZ = rotateAngle;
      }
    }

    let targetX = baseRotationX;
    let targetY = baseRotationY;
    let easing = 0.12;

    if (animationMode === 'followHover') {
      const rangeRadians = (settings.animation.hoverRange * Math.PI) / 180;

      if (
        settings.animation.hoverReturn ||
        interaction.mouseX !== 0.5 ||
        interaction.mouseY !== 0.5
      ) {
        interaction.targetRotationX = (interaction.mouseY - 0.5) * rangeRadians;
        interaction.targetRotationY = (interaction.mouseX - 0.5) * rangeRadians;
      }

      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;
      easing = settings.animation.hoverEase;
    } else if (animationMode === 'followDrag') {
      if (!interaction.dragging && settings.animation.dragMomentum) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - settings.animation.dragFriction;
        interaction.velocityY *= 1 - settings.animation.dragFriction;
      }

      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;
      easing = settings.animation.dragFriction;
    } else if (animationMode === 'autoRotate') {
      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;

      if (interaction.dragging) {
        targetX = interaction.targetRotationX;
        targetY = interaction.targetRotationY;
      }

      easing = 0.08;
    }

    interaction.rotationX += (targetX - interaction.rotationX) * easing;
    interaction.rotationY += (targetY - interaction.rotationY) * easing;
    interaction.rotationZ +=
      (baseRotationZ - interaction.rotationZ) *
      (settings.animation.rotatePingPong ? 0.18 : 0.12);

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );

    if (!settings.halftone.enabled) {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene3d, camera);
      return;
    }

    renderer.setRenderTarget(sceneTarget);
    renderer.render(scene3d, camera);

    blurHorizontalMaterial.uniforms.tInput.value = sceneTarget.texture;
    renderer.setRenderTarget(blurTargetA);
    renderer.render(blurHorizontalScene, orthographicCamera);

    blurVerticalMaterial.uniforms.tInput.value = blurTargetA.texture;
    renderer.setRenderTarget(blurTargetB);
    renderer.render(blurVerticalScene, orthographicCamera);

    blurHorizontalMaterial.uniforms.tInput.value = blurTargetB.texture;
    renderer.setRenderTarget(blurTargetA);
    renderer.render(blurHorizontalScene, orthographicCamera);

    blurVerticalMaterial.uniforms.tInput.value = blurTargetA.texture;
    renderer.setRenderTarget(blurTargetB);
    renderer.render(blurVerticalScene, orthographicCamera);

    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(postScene, orthographicCamera);
  };

  renderFrame();

  return () => {
    window.cancelAnimationFrame(animationFrameId);
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    material.dispose();
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    environmentTexture.dispose();
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}
`;
}

export function getExportedModelFile(
  shape: HalftoneGeometrySpec | undefined,
  importedFile: File | undefined,
) {
  if (!shape || shape.kind !== 'imported' || !importedFile) {
    return null;
  }

  return importedFile;
}

export function generateReactComponent(
  settings: HalftoneStudioSettings,
  selectedShape: HalftoneGeometrySpec | undefined,
) {
  const shape = createShapeDescriptor(selectedShape, settings);
  const defaultModelUrl = shape.filename ?? 'model.glb';
  const background = settings.background.transparent
    ? 'transparent'
    : settings.background.color;

  return `import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

${serializeRuntimeSource(settings, shape)}

${createMountScript()}

type HalftoneDashesProps = {
  modelUrl?: string;
  style?: CSSProperties;
};

export default function HalftoneDashes({
  modelUrl = ${JSON.stringify(`./${defaultModelUrl}`)},
  style,
}: HalftoneDashesProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmount = mountHalftoneCanvas({
      container,
      modelUrl,
      onError: (error) => {
        console.error(error);
      },
    });

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, [modelUrl]);

  return (
    <div
      ref={mountReference}
      style={{
        background: ${JSON.stringify(background)},
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );
}
`;
}

export function generateStandaloneHtml(
  settings: HalftoneStudioSettings,
  selectedShape: HalftoneGeometrySpec | undefined,
) {
  const shape = createShapeDescriptor(selectedShape, settings);
  const defaultModelUrl = shape.filename ?? 'model.glb';
  const background = settings.background.transparent
    ? 'transparent'
    : settings.background.color;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Halftone Dashes</title>
    <link rel="icon" href="data:," />
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html,
      body {
        height: 100%;
      }

      body {
        background: ${background};
        color: rgba(255, 255, 255, 0.72);
        font-family: system-ui, sans-serif;
        overflow: hidden;
      }

      #app {
        height: 100%;
        width: 100%;
      }

      #canvas-root {
        height: 100%;
        width: 100%;
      }

      .caption {
        background: rgba(18, 18, 22, 0.72);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        bottom: 20px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
        left: 20px;
        line-height: 1.5;
        max-width: min(320px, calc(100vw - 40px));
        padding: 12px 14px;
        position: fixed;
      }

      .caption code {
        color: #9d90fa;
        font-family: ui-monospace, monospace;
      }
    </style>
  </head>
  <body>
    <div id="app">
      <div id="canvas-root"></div>
      <div class="caption">
        Standalone export of the current halftone scene.
        ${shape.kind === 'imported' ? `Place <code>${defaultModelUrl}</code> next to this HTML file to keep the current uploaded shape.` : ''}
      </div>
    </div>

    <script type="importmap">
      {
        "imports": {
          "three": "https://unpkg.com/three@0.183.2/build/three.module.js",
          "three/addons/": "https://unpkg.com/three@0.183.2/examples/jsm/"
        }
      }
    </script>
    <script type="module">
      import * as THREE from 'three';
      import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
      import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
      import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

      ${serializeRuntimeSource(settings, shape)}

      ${createMountScript()}

      const container = document.getElementById('canvas-root');

      mountHalftoneCanvas({
        container,
        modelUrl: ${JSON.stringify(`./${defaultModelUrl}`)},
        onError: (error) => {
          console.error(error);
        },
      });
    </script>
  </body>
</html>`;
}
