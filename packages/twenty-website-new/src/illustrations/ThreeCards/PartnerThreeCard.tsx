// @ts-nocheck
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


const DRACO_DECODER_PATH =
  'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const settings = {
  "sourceMode": "shape",
  "shapeKey": "userUpload_1776089370856",
  "lighting": {
    "intensity": 1.5,
    "fillIntensity": 0.48,
    "ambientIntensity": 0.3,
    "angleDegrees": 53,
    "height": 2
  },
  "material": {
    "surface": "solid",
    "color": "#d4d0c8",
    "roughness": 0.42,
    "metalness": 0.15,
    "thickness": 150,
    "refraction": 2,
    "environmentPower": 5
  },
  "halftone": {
    "enabled": true,
    "scale": 14,
    "power": 0.4,
    "width": 0.5,
    "imageContrast": 1,
    "dashColor": "#4A38F5",
    "hoverDashColor": "#4A38F5"
  },
  "background": {
    "transparent": true,
    "color": "#000000"
  },
  "animation": {
    "autoRotateEnabled": true,
    "breatheEnabled": false,
    "cameraParallaxEnabled": false,
    "followHoverEnabled": false,
    "followDragEnabled": true,
    "floatEnabled": false,
    "hoverHalftoneEnabled": false,
    "hoverLightEnabled": false,
    "dragFlowEnabled": false,
    "lightSweepEnabled": false,
    "rotateEnabled": false,
    "autoSpeed": 0.1,
    "autoWobble": 0,
    "breatheAmount": 0.04,
    "breatheSpeed": 0.8,
    "cameraParallaxAmount": 0.3,
    "cameraParallaxEase": 0.08,
    "driftAmount": 8,
    "hoverRange": 25,
    "hoverEase": 0.19,
    "hoverReturn": true,
    "dragSens": 0.008,
    "dragFriction": 0.08,
    "dragMomentum": true,
    "rotateAxis": "y",
    "rotatePreset": "axis",
    "rotateSpeed": 0.1,
    "rotatePingPong": false,
    "floatAmplitude": 0.16,
    "floatSpeed": 0.8,
    "lightSweepHeightRange": 0.5,
    "lightSweepRange": 28,
    "lightSweepSpeed": 0.7,
    "springDamping": 0.6,
    "springReturnEnabled": true,
    "springStrength": 0.06,
    "hoverHalftonePowerShift": 0.42,
    "hoverHalftoneRadius": 0.2,
    "hoverHalftoneWidthShift": -0.18,
    "hoverLightIntensity": 0.8,
    "hoverLightRadius": 0.2,
    "dragFlowDecay": 0.08,
    "dragFlowRadius": 0.24,
    "dragFlowStrength": 1.8,
    "hoverWarpStrength": 3,
    "hoverWarpRadius": 0.15,
    "dragWarpStrength": 5,
    "waveEnabled": false,
    "waveSpeed": 1,
    "waveAmount": 2
  }
};
const shape = {
  "filename": "partner-three-card.glb",
  "key": "userUpload_1776089370856",
  "kind": "imported",
  "label": "partner three-card illustration",
  "loader": "glb"
};
const initialPose = {
  "autoElapsed": 11.523399999928483,
  "rotateElapsed": 0,
  "rotationX": -4.020043134225878e-15,
  "rotationY": 1.1339840023154435,
  "rotationZ": 0,
  "targetRotationX": 0,
  "targetRotationY": 0,
  "timeElapsed": 11.523399999928476
};
const DIAMOND_MODEL_URL = '/illustrations/home/three-cards/diamond.glb';
const LEGACY_IMPORTED_GEOMETRY_SCALE_TARGET = 2.75;
const previewDistance = 4.5;
const VIRTUAL_RENDER_HEIGHT = 768;
const passThroughVertexShader = "\n  varying vec2 vUv;\n\n  void main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n  }\n";
const blurFragmentShader = "\n  precision highp float;\n\n  uniform sampler2D tInput;\n  uniform vec2 dir;\n  uniform vec2 res;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 sum = vec4(0.0);\n    vec2 px = dir / res;\n\n    float w[5];\n    w[0] = 0.227027;\n    w[1] = 0.1945946;\n    w[2] = 0.1216216;\n    w[3] = 0.054054;\n    w[4] = 0.016216;\n\n    sum += texture2D(tInput, vUv) * w[0];\n\n    for (int i = 1; i < 5; i++) {\n      float fi = float(i) * 3.0;\n      sum += texture2D(tInput, vUv + px * fi) * w[i];\n      sum += texture2D(tInput, vUv - px * fi) * w[i];\n    }\n\n    gl_FragColor = sum;\n  }\n";
const halftoneFragmentShader = "\n  precision highp float;\n\n  uniform sampler2D tScene;\n  uniform sampler2D tGlow;\n  uniform vec2 effectResolution;\n  uniform vec2 logicalResolution;\n  uniform float tile;\n  uniform float s_3;\n  uniform float s_4;\n  uniform vec3 dashColor;\n  uniform vec3 hoverDashColor;\n  uniform float time;\n  uniform float waveAmount;\n  uniform float waveSpeed;\n  uniform float footprintScale;\n  uniform vec2 interactionUv;\n  uniform vec2 interactionVelocity;\n  uniform vec2 dragOffset;\n  uniform float hoverHalftoneActive;\n  uniform float hoverHalftonePowerShift;\n  uniform float hoverHalftoneRadius;\n  uniform float hoverHalftoneWidthShift;\n  uniform float hoverLightStrength;\n  uniform float hoverLightRadius;\n  uniform float hoverFlowStrength;\n  uniform float hoverFlowRadius;\n  uniform float dragFlowStrength;\n  uniform float cropToBounds;\n\n  varying vec2 vUv;\n\n  float distSegment(in vec2 p, in vec2 a, in vec2 b) {\n    vec2 pa = p - a;\n    vec2 ba = b - a;\n    float denom = max(dot(ba, ba), 0.000001);\n    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);\n    return length(pa - ba * h);\n  }\n\n  float lineSimpleEt(in vec2 p, in float r, in float thickness) {\n    vec2 a = vec2(0.5) + vec2(-r, 0.0);\n    vec2 b = vec2(0.5) + vec2(r, 0.0);\n    float distToSegment = distSegment(p, a, b);\n    float halfThickness = thickness * r;\n    return distToSegment - halfThickness;\n  }\n\n  void main() {\n    if (cropToBounds > 0.5) {\n      vec4 boundsCheck = texture2D(tScene, vUv);\n      if (boundsCheck.a < 0.01) {\n        gl_FragColor = vec4(0.0);\n        return;\n      }\n    }\n\n    vec2 fragCoord =\n      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;\n    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);\n    vec2 pointerPx = interactionUv * logicalResolution;\n    vec2 fragDelta = fragCoord - pointerPx;\n    float fragDist = length(fragDelta);\n    vec2 radialDir = fragDist > 0.001 ? fragDelta / fragDist : vec2(0.0, 1.0);\n    float velocityMagnitude = length(interactionVelocity);\n    vec2 motionDir = velocityMagnitude > 0.001\n      ? interactionVelocity / velocityMagnitude\n      : vec2(0.0, 0.0);\n    float motionBias = velocityMagnitude > 0.001\n      ? dot(-radialDir, motionDir) * 0.5 + 0.5\n      : 0.5;\n\n    float hoverLightMask = 0.0;\n    if (hoverLightStrength > 0.0) {\n      float lightRadiusPx = hoverLightRadius * logicalResolution.y;\n      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);\n    }\n\n    float hoverHalftoneMask = 0.0;\n    if (hoverHalftoneActive > 0.0) {\n      float hoverHalftoneRadiusPx = hoverHalftoneRadius * logicalResolution.y;\n      hoverHalftoneMask = smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist);\n    }\n\n    float hoverFlowMask = 0.0;\n    if (hoverFlowStrength > 0.0) {\n      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;\n      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);\n    }\n\n    vec2 hoverDisplacement =\n      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +\n      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * halftoneSize * 1.15;\n    vec2 travelDisplacement = dragOffset * dragFlowStrength * 0.45;\n    vec2 effectCoord = fragCoord + hoverDisplacement + travelDisplacement;\n\n    float bandRow = floor(effectCoord.y / halftoneSize);\n    float waveOffset =\n      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;\n    effectCoord.x += waveOffset;\n\n    vec2 cellIndex = floor(effectCoord / halftoneSize);\n    vec2 sampleUv = clamp(\n      (cellIndex + 0.5) * halftoneSize / logicalResolution,\n      vec2(0.0),\n      vec2(1.0)\n    );\n    vec2 cellUv = fract(effectCoord / halftoneSize);\n\n    vec4 sceneSample = texture2D(tScene, sampleUv);\n    float mask = smoothstep(0.02, 0.08, sceneSample.a);\n    float localPower = clamp(\n      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,\n      -1.5,\n      1.5\n    );\n    float localWidth = clamp(\n      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,\n      0.05,\n      1.4\n    );\n    float lightLift =\n      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;\n    float bandRadius = clamp(\n      (\n        (\n          sceneSample.r +\n          sceneSample.g +\n          sceneSample.b +\n          localPower * length(vec2(0.5))\n        ) *\n        (1.0 / 3.0)\n      ) + lightLift,\n      0.0,\n      1.0\n    ) * 1.86 * 0.5;\n\n    float alpha = 0.0;\n    if (bandRadius > 0.0001) {\n      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);\n      float edge = 0.02;\n      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;\n    }\n\n    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);\n    vec3 color = activeDashColor * alpha;\n    gl_FragColor = vec4(color, alpha);\n\n    #include <tonemapping_fragment>\n    #include <colorspace_fragment>\n  }\n";



const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;

function getModelOverrides(modelUrl) {
  if (modelUrl !== DIAMOND_MODEL_URL) {
    return null;
  }

  return {
    animation: {
      autoRotateEnabled: false,
    },
    importedGeometry: {
      useLegacyNormalization: true,
    },
    initialPose: {
      ...initialPose,
      autoElapsed: 42.43333333333221,
      rotateElapsed: 89.98333333332951,
      rotationX: -8.99639917695435,
      rotationY: -8.99639917695435,
      timeElapsed: 851.4676000003166,
    },
  };
}

function clampRectToViewport(rect, viewportWidth, viewportHeight) {
  const minX = Math.max(rect.x, 0);
  const minY = Math.max(rect.y, 0);
  const maxX = Math.min(rect.x + rect.width, viewportWidth);
  const maxY = Math.min(rect.y + rect.height, viewportHeight);

  if (maxX <= minX || maxY <= minY) {
    return null;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function getRectArea(rect) {
  if (!rect) {
    return 0;
  }

  return Math.max(rect.width, 0) * Math.max(rect.height, 0);
}

function createBox3Corners(bounds) {
  const { min, max } = bounds;

  return [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];
}

function getImagePreviewZoom(previewDistance) {
  return REFERENCE_PREVIEW_DISTANCE / Math.max(previewDistance, 0.001);
}

function getContainedImageRect({
  imageHeight,
  imageWidth,
  viewportHeight,
  viewportWidth,
  zoom,
}) {
  if (
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  const imageAspect = imageWidth / imageHeight;
  const viewAspect = viewportWidth / viewportHeight;

  let fittedWidth = viewportWidth;
  let fittedHeight = viewportHeight;

  if (imageAspect > viewAspect) {
    fittedHeight = viewportWidth / imageAspect;
  } else {
    fittedWidth = viewportHeight * imageAspect;
  }

  const scaledWidth = fittedWidth * zoom;
  const scaledHeight = fittedHeight * zoom;

  return clampRectToViewport(
    {
      x: (viewportWidth - scaledWidth) * 0.5,
      y: (viewportHeight - scaledHeight) * 0.5,
      width: scaledWidth,
      height: scaledHeight,
    },
    viewportWidth,
    viewportHeight,
  );
}

function getFootprintScaleFromRects(currentRect, referenceRect) {
  const currentArea = getRectArea(currentRect);
  const referenceArea = getRectArea(referenceRect);

  if (currentArea <= 0 || referenceArea <= 0) {
    return 1;
  }

  return Math.max(
    Math.sqrt(currentArea / referenceArea),
    MIN_FOOTPRINT_SCALE,
  );
}

function getImageFootprintScale({
  imageHeight,
  imageWidth,
  previewDistance,
  viewportHeight,
  viewportWidth,
}) {
  const currentRect = getContainedImageRect({
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: getImagePreviewZoom(previewDistance),
  });
  const referenceRect = getContainedImageRect({
    imageHeight,
    imageWidth,
    viewportHeight,
    viewportWidth,
    zoom: 1,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}

function projectBox3ToViewport({
  camera,
  localBounds,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}) {
  if (
    localBounds.isEmpty() ||
    viewportWidth <= 0 ||
    viewportHeight <= 0
  ) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let hasProjectedCorner = false;

  for (const corner of createBox3Corners(localBounds)) {
    corner.applyMatrix4(meshMatrixWorld).project(camera);

    if (
      !Number.isFinite(corner.x) ||
      !Number.isFinite(corner.y) ||
      !Number.isFinite(corner.z)
    ) {
      continue;
    }

    hasProjectedCorner = true;

    const x = (corner.x * 0.5 + 0.5) * viewportWidth;
    const y = (1 - (corner.y * 0.5 + 0.5)) * viewportHeight;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (!hasProjectedCorner) {
    return null;
  }

  return clampRectToViewport(
    {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    },
    viewportWidth,
    viewportHeight,
  );
}

function getMeshFootprintScale({
  camera,
  localBounds,
  lookAtTarget,
  meshMatrixWorld,
  viewportHeight,
  viewportWidth,
}) {
  const currentRect = projectBox3ToViewport({
    camera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
  });
  const referenceCamera = camera.clone();
  const currentOffset = referenceCamera.position.clone().sub(lookAtTarget);
  const referenceOffset =
    currentOffset.lengthSq() > 0
      ? currentOffset.setLength(REFERENCE_PREVIEW_DISTANCE)
      : new THREE.Vector3(0, 0, REFERENCE_PREVIEW_DISTANCE);

  referenceCamera.position.copy(lookAtTarget).add(referenceOffset);
  referenceCamera.lookAt(lookAtTarget);
  referenceCamera.updateProjectionMatrix();
  referenceCamera.updateMatrixWorld(true);

  const referenceRect = projectBox3ToViewport({
    camera: referenceCamera,
    localBounds,
    meshMatrixWorld,
    viewportHeight,
    viewportWidth,
  });

  return getFootprintScaleFromRects(currentRect, referenceRect);
}



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



const EMPTY_TEXTURE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=';

function createLoadingManager() {
  const loadingManager = new THREE.LoadingManager();
  loadingManager.setURLModifier((url) =>
    /\.(png|jpe?g|webp|gif|bmp)$/i.test(url) ? EMPTY_TEXTURE_DATA_URL : url,
  );
  return loadingManager;
}

function normalizeImportedGeometry(
  geometry,
  options = {},
) {
  const { useLegacyNormalization = false } = options;
  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

  if (!useLegacyNormalization) {
    const dimensions = [size.x, size.y, size.z];
    const thinnestAxis = dimensions.indexOf(Math.min(...dimensions));

    if (thinnestAxis === 0) {
      geometry.applyMatrix4(new THREE.Matrix4().makeRotationY(Math.PI / 2));
    } else if (thinnestAxis === 1) {
      geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    }
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const scale = useLegacyNormalization
    ? LEGACY_IMPORTED_GEOMETRY_SCALE_TARGET /
      Math.max(size.x, size.y, size.z, 0.001)
    : 1.6 / (geometry.boundingSphere?.radius || 1);
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

function extractMergedGeometry(root, emptyMessage, geometryOptions) {
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

  return normalizeImportedGeometry(
    mergeGeometries(geometries),
    geometryOptions,
  );
}

function parseFbxGeometry(buffer, label, geometryOptions) {
  const originalWarn = console.warn;

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].startsWith('THREE.FBXLoader:')) {
      return;
    }

    originalWarn(...args);
  };

  try {
    const root = new FBXLoader(createLoadingManager()).parse(buffer, '');
    return extractMergedGeometry(
      root,
      label + ' did not contain any mesh geometry.',
      geometryOptions,
    );
  } finally {
    console.warn = originalWarn;
  }
}

function parseGlbGeometry(buffer, label, geometryOptions) {
  return new Promise((resolve, reject) => {
    const loadingManager = createLoadingManager();
    const dracoLoader = new DRACOLoader(loadingManager);
    dracoLoader.setDecoderPath(DRACO_DECODER_PATH);

    const loader = new GLTFLoader(loadingManager);
    loader.setDRACOLoader(dracoLoader);

    const cleanup = () => {
      dracoLoader.dispose();
    };

    loader.parse(
      buffer,
      '',
      (gltf) => {
        try {
          resolve(
            extractMergedGeometry(
              gltf.scene,
              label + ' did not contain any mesh geometry.',
              geometryOptions,
            ),
          );
        } catch (error) {
          reject(error);
        } finally {
          cleanup();
        }
      },
      (error) => {
        cleanup();
        reject(error);
      },
    );
  });
}

async function loadImportedGeometryFromUrl(
  loader,
  modelUrl,
  label,
  geometryOptions,
) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error('Unable to load ' + label + ' from ' + modelUrl + '.');
  }

  const buffer = await response.arrayBuffer();

  if (loader === 'fbx') {
    return parseFbxGeometry(buffer, label, geometryOptions);
  }

  return parseGlbGeometry(buffer, label, geometryOptions);
}



const GLASS_ENVIRONMENT_DATA_URL = "data:image/jpeg;base64,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";
const GLASS_THICKNESS_TO_WORLD_UNITS = 1 / 320;
const GLASS_ATTENUATION_DISTANCE_MIN = 0.12;
const GLASS_ENVIRONMENT_INTENSITY_BASE = 0.18;
const GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER = 0.12;
const GLASS_ENVIRONMENT_ZOOM = 1.55;
const GLASS_TRANSMISSION_BACKGROUND = new THREE.Color(0x030303);
const MAX_TEXTURE_ANISOTROPY = 8;
const HALFTONE_TRANSMISSION_SHADER_PREFIX = "\nuniform float chromaticAberration;\nuniform float anisotropicBlur;\nuniform float time;\nuniform float distortion;\nuniform float distortionScale;\nuniform float temporalDistortion;\nuniform sampler2D buffer;\n\nvec3 random3(vec3 c) {\n  float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));\n  vec3 r;\n  r.z = fract(512.0 * j);\n  j *= 0.125;\n  r.x = fract(512.0 * j);\n  j *= 0.125;\n  r.y = fract(512.0 * j);\n  return r - 0.5;\n}\n\nuint hash(uint x) {\n  x += (x << 10u);\n  x ^= (x >> 6u);\n  x += (x << 3u);\n  x ^= (x >> 11u);\n  x += (x << 15u);\n  return x;\n}\n\nuint hash(uvec2 v) { return hash(v.x ^ hash(v.y)); }\nuint hash(uvec3 v) { return hash(v.x ^ hash(v.y) ^ hash(v.z)); }\nuint hash(uvec4 v) {\n  return hash(v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w));\n}\n\nfloat floatConstruct(uint m) {\n  const uint ieeeMantissa = 0x007FFFFFu;\n  const uint ieeeOne = 0x3F800000u;\n  m &= ieeeMantissa;\n  m |= ieeeOne;\n  float f = uintBitsToFloat(m);\n  return f - 1.0;\n}\n\nfloat randomBase(float x) {\n  return floatConstruct(hash(floatBitsToUint(x)));\n}\nfloat randomBase(vec2 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\nfloat randomBase(vec3 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\nfloat randomBase(vec4 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\n\nfloat rand(float seed) {\n  return randomBase(vec3(gl_FragCoord.xy, seed));\n}\n\nconst float F3 = 0.3333333;\nconst float G3 = 0.1666667;\n\nfloat snoise(vec3 p) {\n  vec3 s = floor(p + dot(p, vec3(F3)));\n  vec3 x = p - s + dot(s, vec3(G3));\n  vec3 e = step(vec3(0.0), x - x.yzx);\n  vec3 i1 = e * (1.0 - e.zxy);\n  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\n  vec3 x1 = x - i1 + G3;\n  vec3 x2 = x - i2 + 2.0 * G3;\n  vec3 x3 = x - 1.0 + 3.0 * G3;\n  vec4 w;\n  vec4 d;\n  w.x = dot(x, x);\n  w.y = dot(x1, x1);\n  w.z = dot(x2, x2);\n  w.w = dot(x3, x3);\n  w = max(0.6 - w, 0.0);\n  d.x = dot(random3(s), x);\n  d.y = dot(random3(s + i1), x1);\n  d.z = dot(random3(s + i2), x2);\n  d.w = dot(random3(s + 1.0), x3);\n  w *= w;\n  w *= w;\n  d *= w;\n  return dot(d, vec4(52.0));\n}\n\nfloat snoiseFractal(vec3 m) {\n  return 0.5333333 * snoise(m)\n    + 0.2666667 * snoise(2.0 * m)\n    + 0.1333333 * snoise(4.0 * m)\n    + 0.0666667 * snoise(8.0 * m);\n}\n";
const HALFTONE_TRANSMISSION_PARS_FRAGMENT = "\n#ifdef USE_TRANSMISSION\n  uniform float _transmission;\n  uniform float thickness;\n  uniform float attenuationDistance;\n  uniform vec3 attenuationColor;\n  uniform sampler2D refractionEnvMap;\n  uniform float useEnvMapRefraction;\n  #ifdef USE_TRANSMISSIONMAP\n    uniform sampler2D transmissionMap;\n  #endif\n  #ifdef USE_THICKNESSMAP\n    uniform sampler2D thicknessMap;\n  #endif\n  uniform vec2 transmissionSamplerSize;\n  uniform sampler2D transmissionSamplerMap;\n  uniform mat4 modelMatrix;\n  uniform mat4 projectionMatrix;\n  varying vec3 vWorldPosition;\n\n  vec3 getVolumeTransmissionRay(\n    const in vec3 n,\n    const in vec3 v,\n    const in float thicknessValue,\n    const in float ior,\n    const in mat4 modelMatrix\n  ) {\n    vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);\n    vec3 modelScale;\n    modelScale.x = length(vec3(modelMatrix[0].xyz));\n    modelScale.y = length(vec3(modelMatrix[1].xyz));\n    modelScale.z = length(vec3(modelMatrix[2].xyz));\n    return normalize(refractionVector) * thicknessValue * modelScale;\n  }\n\n  float applyIorToRoughness(\n    const in float roughnessValue,\n    const in float ior\n  ) {\n    return roughnessValue * clamp(ior * 2.0 - 2.0, 0.0, 1.0);\n  }\n\n  vec2 directionToEquirectUv(const in vec3 direction) {\n    vec3 dir = normalize(direction);\n    vec2 uv = vec2(\n      atan(dir.z, dir.x) * 0.15915494309189535 + 0.5,\n      asin(clamp(dir.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5\n    );\n\n    return vec2(fract(uv.x), 1.0 - clamp(uv.y, 0.0, 1.0));\n  }\n\n  vec4 getTransmissionSample(\n    const in vec2 fragCoord,\n    const in vec3 transmissionDirection,\n    const in float roughnessValue,\n    const in float ior\n  ) {\n    if (useEnvMapRefraction > 0.5) {\n      return texture2D(\n        refractionEnvMap,\n        directionToEquirectUv(transmissionDirection)\n      );\n    }\n\n    float framebufferLod =\n      log2(transmissionSamplerSize.x) *\n      applyIorToRoughness(roughnessValue, ior);\n    return texture2D(buffer, fragCoord.xy);\n  }\n\n  vec3 applyVolumeAttenuation(\n    const in vec3 radiance,\n    const in float transmissionDistance,\n    const in vec3 attenuationColorValue,\n    const in float attenuationDistanceValue\n  ) {\n    if (isinf(attenuationDistanceValue)) {\n      return radiance;\n    }\n\n    vec3 attenuationCoefficient =\n      -log(attenuationColorValue) / attenuationDistanceValue;\n    vec3 transmittance =\n      exp(-attenuationCoefficient * transmissionDistance);\n\n    return transmittance * radiance;\n  }\n\n  vec4 getIBLVolumeRefraction(\n    const in vec3 n,\n    const in vec3 v,\n    const in float roughnessValue,\n    const in vec3 diffuseColor,\n    const in vec3 specularColor,\n    const in float specularF90,\n    const in vec3 position,\n    const in mat4 modelMatrix,\n    const in mat4 viewMatrix,\n    const in mat4 projMatrix,\n    const in float ior,\n    const in float thicknessValue,\n    const in vec3 attenuationColorValue,\n    const in float attenuationDistanceValue\n  ) {\n    vec3 transmissionRay = getVolumeTransmissionRay(\n      n,\n      v,\n      thicknessValue,\n      ior,\n      modelMatrix\n    );\n    vec3 refractedRayExit = position + transmissionRay;\n    vec4 ndcPos =\n      projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);\n    vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n    refractionCoords += 1.0;\n    refractionCoords /= 2.0;\n    vec3 transmissionDirection = normalize(transmissionRay);\n    vec4 transmittedLight = getTransmissionSample(\n      refractionCoords,\n      transmissionDirection,\n      roughnessValue,\n      ior\n    );\n    vec3 attenuatedColor = applyVolumeAttenuation(\n      transmittedLight.rgb,\n      length(transmissionRay),\n      attenuationColorValue,\n      attenuationDistanceValue\n    );\n    vec3 F = EnvironmentBRDF(\n      n,\n      v,\n      specularColor,\n      specularF90,\n      roughnessValue\n    );\n    return vec4(\n      (1.0 - F) * attenuatedColor * diffuseColor,\n      transmittedLight.a\n    );\n  }\n#endif\n";
const HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE = "\nmaterial.transmission = _transmission;\nmaterial.transmissionAlpha = 1.0;\nmaterial.thickness = thickness;\nmaterial.attenuationDistance = attenuationDistance;\nmaterial.attenuationColor = attenuationColor;\n#ifdef USE_TRANSMISSIONMAP\n  material.transmission *= texture2D(transmissionMap, vUv).r;\n#endif\n#ifdef USE_THICKNESSMAP\n  material.thickness *= texture2D(thicknessMap, vUv).g;\n#endif\n\nvec3 pos = vWorldPosition;\nfloat runningSeed = 0.0;\nvec3 v = normalize(cameraPosition - pos);\nvec3 n = inverseTransformDirection(normal, viewMatrix);\nvec3 transmission = vec3(0.0);\nfloat transmissionR;\nfloat transmissionG;\nfloat transmissionB;\nfloat randomCoords = rand(runningSeed++);\nfloat thicknessSmear =\n  thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);\nvec3 distortionNormal = vec3(0.0);\nvec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;\n\nif (distortion > 0.0) {\n  distortionNormal = distortion * vec3(\n    snoiseFractal(vec3(pos * distortionScale + temporalOffset)),\n    snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)),\n    snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset))\n  );\n}\n\nfor (float i = 0.0; i < __SAMPLES__.0; i++) {\n  vec3 sampleNorm = normalize(\n    n +\n    roughnessFactor * roughnessFactor * 2.0 *\n    normalize(\n      vec3(\n        rand(runningSeed++) - 0.5,\n        rand(runningSeed++) - 0.5,\n        rand(runningSeed++) - 0.5\n      )\n    ) *\n    pow(rand(runningSeed++), 0.33) +\n    distortionNormal\n  );\n\n  transmissionR = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior,\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).r;\n\n  transmissionG = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior * (1.0 + chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).g;\n\n  transmissionB = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).b;\n\n  transmission.r += transmissionR;\n  transmission.g += transmissionG;\n  transmission.b += transmissionB;\n}\n\ntransmission /= __SAMPLES__.0;\ntotalDiffuse = mix(totalDiffuse, transmission.rgb, material.transmission);\n";

class HalftoneTransmissionMaterial extends THREE.MeshPhysicalMaterial {
  constructor(samples = 10) {
    super();

    this.halftoneUniforms = {
      chromaticAberration: { value: 0.05 },
      transmission: { value: 0 },
      _transmission: { value: 1 },
      transmissionMap: { value: null },
      refractionEnvMap: { value: null },
      useEnvMapRefraction: { value: 0 },
      roughness: { value: 0 },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      attenuationDistance: { value: Infinity },
      attenuationColor: { value: new THREE.Color('white') },
      anisotropicBlur: { value: 0.1 },
      time: { value: 0 },
      distortion: { value: 0 },
      distortionScale: { value: 0.5 },
      temporalDistortion: { value: 0 },
      buffer: { value: null },
    };

    this.customProgramCacheKey = () => 'halftone-transmission-' + samples;

    this.onBeforeCompile = (shader) => {
      shader.uniforms = {
        ...shader.uniforms,
        ...this.halftoneUniforms,
      };
      shader.defines ??= {};

      if (this.anisotropy > 0) {
        shader.defines.USE_ANISOTROPY = '';
      }

      shader.defines.USE_TRANSMISSION = '';
      shader.fragmentShader =
        HALFTONE_TRANSMISSION_SHADER_PREFIX + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        HALFTONE_TRANSMISSION_PARS_FRAGMENT,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_fragment>',
        HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE.replaceAll(
          '__SAMPLES__',
          String(samples),
        ),
      );
    };

    Object.keys(this.halftoneUniforms).forEach((key) => {
      Object.defineProperty(this, key, {
        configurable: true,
        enumerable: true,
        get: () => this.halftoneUniforms[key]?.value,
        set: (value) => {
          this.halftoneUniforms[key].value = value;
        },
      });
    });
  }
}

function setTextureSampling(texture, renderer) {
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = Math.min(
    renderer.capabilities.getMaxAnisotropy(),
    MAX_TEXTURE_ANISOTROPY,
  );
}

function disposeEnvironmentScene(scene) {
  scene.traverse((object) => {
    if (object.geometry) {
      object.geometry.dispose();
    }

    if (Array.isArray(object.material)) {
      object.material.forEach((material) => material.dispose());
      return;
    }

    object.material?.dispose?.();
  });
}

function createSolidEnvironmentTexture(renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = pmremGenerator.fromScene(
    new RoomEnvironment(),
    0.04,
  ).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function getTextureImageSize(texture) {
  const image = texture.image;

  return {
    height:
      image?.naturalHeight ?? image?.videoHeight ?? image?.height ?? undefined,
    width:
      image?.naturalWidth ?? image?.videoWidth ?? image?.width ?? undefined,
  };
}

function createZoomedGlassTexture(sourceTexture, renderer, zoom) {
  if (zoom <= 1) {
    return sourceTexture;
  }

  const { width, height } = getTextureImageSize(sourceTexture);

  if (!width || !height) {
    return sourceTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');

  if (!context) {
    return sourceTexture;
  }

  const cropWidth = width / zoom;
  const cropHeight = height / zoom;
  const sourceX = (width - cropWidth) / 2;
  const sourceY = (height - cropHeight) / 2;

  context.drawImage(
    sourceTexture.image,
    sourceX,
    sourceY,
    cropWidth,
    cropHeight,
    0,
    0,
    width,
    height,
  );

  const zoomedTexture = new THREE.CanvasTexture(canvas);
  zoomedTexture.colorSpace = sourceTexture.colorSpace;
  zoomedTexture.wrapS = THREE.ClampToEdgeWrapping;
  zoomedTexture.wrapT = THREE.ClampToEdgeWrapping;
  setTextureSampling(zoomedTexture, renderer);
  zoomedTexture.needsUpdate = true;

  return zoomedTexture;
}

function createStudioGlassEnvironmentTexture(renderer, backdropTexture) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentTexture = backdropTexture
    ? pmremGenerator.fromEquirectangular(backdropTexture).texture
    : pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  pmremGenerator.dispose();

  return environmentTexture;
}

function createFallbackGlassBackdropTexture(renderer) {
  const texture = new THREE.DataTexture(
    new Uint8Array([3, 3, 3, 255]),
    1,
    1,
    THREE.RGBAFormat,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  setTextureSampling(texture, renderer);
  texture.needsUpdate = true;

  return texture;
}

function loadTexture(url, renderer, colorSpace) {
  const loader = new THREE.TextureLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = colorSpace;
        setTextureSampling(texture, renderer);
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

async function loadGlassEnvironmentTexture(renderer) {
  const sourceBackgroundTexture = await loadTexture(
    GLASS_ENVIRONMENT_DATA_URL,
    renderer,
    THREE.SRGBColorSpace,
  );
  const backgroundTexture = createZoomedGlassTexture(
    sourceBackgroundTexture,
    renderer,
    GLASS_ENVIRONMENT_ZOOM,
  );
  if (backgroundTexture !== sourceBackgroundTexture) {
    sourceBackgroundTexture.dispose();
  }
  backgroundTexture.mapping = THREE.EquirectangularReflectionMapping;
  backgroundTexture.wrapS = THREE.ClampToEdgeWrapping;
  backgroundTexture.wrapT = THREE.ClampToEdgeWrapping;
  backgroundTexture.needsUpdate = true;
  const environmentTexture = createStudioGlassEnvironmentTexture(
    renderer,
    backgroundTexture,
  );

  return {
    backgroundTexture,
    environmentTexture,
  };
}

async function createHalftoneMaterialAssets(renderer) {
  const solidEnvironmentTexture = createSolidEnvironmentTexture(renderer);

  try {
    const glassEnvironmentAssets = await loadGlassEnvironmentTexture(renderer);

    return {
      glassBackgroundTexture: glassEnvironmentAssets.backgroundTexture,
      glassEnvironmentTexture: glassEnvironmentAssets.environmentTexture,
      solidEnvironmentTexture,
    };
  } catch {
    const fallbackGlassBackdropTexture =
      createFallbackGlassBackdropTexture(renderer);
    const fallbackGlassEnvironmentTexture =
      createStudioGlassEnvironmentTexture(renderer);

    return {
      glassBackgroundTexture: fallbackGlassBackdropTexture,
      glassEnvironmentTexture: fallbackGlassEnvironmentTexture,
      solidEnvironmentTexture,
    };
  }
}

function createHalftoneMaterial() {
  return new HalftoneTransmissionMaterial();
}

function applyHalftoneMaterialSettings(material, materialSettings, materialAssets) {
  const isGlass = materialSettings.surface === 'glass';
  const glassThickness =
    materialSettings.thickness * GLASS_THICKNESS_TO_WORLD_UNITS;
  const glassEnvironmentIntensity =
    GLASS_ENVIRONMENT_INTENSITY_BASE +
    materialSettings.environmentPower * GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER;
  const glassAttenuationDistance = Math.max(
    glassThickness * 4,
    GLASS_ATTENUATION_DISTANCE_MIN,
  );

  material.color.set(isGlass ? '#ffffff' : materialSettings.color);
  material.roughness = materialSettings.roughness;
  material.metalness = materialSettings.metalness;
  material.envMap = isGlass
    ? materialAssets.glassEnvironmentTexture
    : materialAssets.solidEnvironmentTexture;
  material.envMapIntensity = isGlass
    ? GLASS_ENVIRONMENT_INTENSITY_BASE +
      materialSettings.environmentPower * GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER
    : 0.25;
  material.clearcoat = isGlass ? 1 : 0;
  material.clearcoatRoughness = isGlass
    ? Math.max(materialSettings.roughness * 0.25, 0.01)
    : 0.08;
  material.reflectivity = isGlass ? 0.98 : 0.5;
  material.transmission = 0;
  material._transmission = isGlass ? 1 : 0;
  material.refractionEnvMap = isGlass ? materialAssets.glassBackgroundTexture : null;
  material.useEnvMapRefraction = isGlass ? 1 : 0;
  material.thickness = isGlass ? glassThickness : 0;
  material.ior = isGlass ? materialSettings.refraction : 1.5;
  material.buffer = null;
  material.bumpMap = null;
  material.bumpScale = 0;
  material.roughnessMap = null;
  material.side = THREE.FrontSide;
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.attenuationColor.set(isGlass ? materialSettings.color : 'white');
  material.attenuationDistance = isGlass
    ? glassAttenuationDistance
    : Infinity;
  material.anisotropicBlur = isGlass
    ? THREE.MathUtils.lerp(0.03, 0.12, materialSettings.roughness)
    : 0.1;
  material.chromaticAberration = isGlass ? 0 : 0.05;
  material.distortion = 0;
  material.distortionScale = 0.5;
  material.temporalDistortion = 0;
  material.userData.halftoneIsGlass = isGlass;
  material.userData.halftoneGlassBacksideThickness = isGlass
    ? glassThickness * 2
    : 0;
  material.userData.halftoneGlassBacksideEnvIntensity = isGlass
    ? glassEnvironmentIntensity * 2.8
    : 0;
  material.userData.halftoneUseEnvironmentRefraction = isGlass;
  material.envMapIntensity = isGlass ? glassEnvironmentIntensity : 0.25;

  material.needsUpdate = true;
}

function disposeHalftoneMaterialAssets(materialAssets) {
  materialAssets.glassBackgroundTexture.dispose();

  if (materialAssets.glassEnvironmentTexture !== materialAssets.glassBackgroundTexture) {
    materialAssets.glassEnvironmentTexture.dispose();
  }

  materialAssets.solidEnvironmentTexture.dispose();
}


function createRenderTarget(width, height) {
  return new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });
}

function createInteractionState(initialPoseConfig = initialPose) {
  return {
    autoElapsed: initialPoseConfig.autoElapsed,
    activePointerId: null,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPoseConfig.rotateElapsed,
    rotationX: initialPoseConfig.rotationX,
    rotationVelocityX: 0,
    rotationY: initialPoseConfig.rotationY,
    rotationVelocityY: 0,
    rotationZ: initialPoseConfig.rotationZ,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPoseConfig.targetRotationX,
    targetRotationY: initialPoseConfig.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}


function setPrimaryLightPosition(light, angleDegrees, height) {
  const lightAngle = (angleDegrees * Math.PI) / 180;
  light.position.set(Math.cos(lightAngle) * 5, height, Math.sin(lightAngle) * 5);
}

function applySpringStep(current, target, velocity, strength, damping) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  const nextValue = current + nextVelocity;

  return {
    value: nextValue,
    velocity: nextVelocity,
  };
}

function resetInteractionState(interactionState) {
  interactionState.dragging = false;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;
  interactionState.autoElapsed = 0;
}

async function createGeometry(modelUrl, geometryOptions) {
  if (shape.kind === 'imported' && shape.loader && modelUrl) {
    return loadImportedGeometryFromUrl(
      shape.loader,
      modelUrl,
      modelUrl.split('/').pop() ?? shape.label,
      geometryOptions,
    );
  }

  return createBuiltinGeometry(shape.key);
}




async function mountHalftoneCanvas(options) {
  const {
    animationOverrides,
    container,
    initialRotationX,
    initialRotationY,
    initialRotationZ,
    modelUrl,
    onError,
  } = options;
  const modelOverrides = getModelOverrides(modelUrl);
  const resolvedAnimation = {
    ...settings.animation,
    ...modelOverrides?.animation,
    ...animationOverrides,
  };
  const resolvedInitialPose = {
    ...initialPose,
    ...modelOverrides?.initialPose,
    rotationX:
      initialRotationX ??
      modelOverrides?.initialPose?.rotationX ??
      initialPose.rotationX,
    rotationY:
      initialRotationY ??
      modelOverrides?.initialPose?.rotationY ??
      initialPose.rotationY,
    rotationZ:
      initialRotationZ ??
      modelOverrides?.initialPose?.rotationZ ??
      initialPose.rotationZ,
  };

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
    geometry = await createGeometry(
      modelUrl,
      modelOverrides?.importedGeometry,
    );
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
  canvas.style.cursor = resolvedAnimation.followDragEnabled ? 'grab' : 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const materialAssets = await createHalftoneMaterialAssets(renderer);

  const scene3d = new THREE.Scene();
  scene3d.background = null;

  const baseCameraDistance = previewDistance;
  const camera = new THREE.PerspectiveCamera(45, getWidth() / getHeight(), 0.1, 100);
  camera.position.z = baseCameraDistance;

  const primaryLight = new THREE.DirectionalLight(0xffffff, settings.lighting.intensity);
  setPrimaryLightPosition(
    primaryLight,
    settings.lighting.angleDegrees,
    settings.lighting.height,
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

  const material = createHalftoneMaterial();
  applyHalftoneMaterialSettings(material, settings.material, materialAssets);

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
      effectResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      logicalResolution: {
        value: new THREE.Vector2(getVirtualWidth(), getVirtualHeight()),
      },
      tile: { value: settings.halftone.scale },
      s_3: { value: settings.halftone.power },
      s_4: { value: settings.halftone.width },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: 1 },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: 0.2 },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightStrength: { value: 0 },
      hoverLightRadius: { value: 0.2 },
      hoverFlowStrength: { value: 0 },
      hoverFlowRadius: { value: 0.18 },
      dragFlowStrength: { value: 0 },
      cropToBounds: { value: 0 },
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

  const updateViewportUniforms = (
    logicalWidth,
    logicalHeight,
    effectWidth,
    effectHeight,
  ) => {
    blurHorizontalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    blurVerticalMaterial.uniforms.res.value.set(effectWidth, effectHeight);
    halftoneMaterial.uniforms.effectResolution.value.set(
      effectWidth,
      effectHeight,
    );
    halftoneMaterial.uniforms.logicalResolution.value.set(
      logicalWidth,
      logicalHeight,
    );
  };

  const getHalftoneScale = (viewportWidth, viewportHeight, lookAtTarget) => {
    if (!mesh.geometry.boundingBox) {
      mesh.geometry.computeBoundingBox();
    }

    if (!mesh.geometry.boundingBox) {
      return 1;
    }

    mesh.updateMatrixWorld();
    camera.updateMatrixWorld();

    return getMeshFootprintScale({
      camera,
      localBounds: mesh.geometry.boundingBox,
      lookAtTarget,
      meshMatrixWorld: mesh.matrixWorld,
      viewportHeight,
      viewportWidth,
    });
  };

  const interaction = createInteractionState(resolvedInitialPose);
  const autoRotateEnabled = resolvedAnimation.autoRotateEnabled;
  const followHoverEnabled = resolvedAnimation.followHoverEnabled;
  const followDragEnabled = resolvedAnimation.followDragEnabled;
  const rotateEnabled = resolvedAnimation.rotateEnabled;

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
    updateViewportUniforms(
      virtualWidth,
      virtualHeight,
      virtualWidth,
      virtualHeight,
    );
  };

  const resizeObserver = new ResizeObserver(syncSize);
  resizeObserver.observe(container);

  const updatePointerPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    interaction.mouseX = THREE.MathUtils.clamp(
      (event.clientX - rect.left) / width,
      0,
      1,
    );
    interaction.mouseY = THREE.MathUtils.clamp(
      (event.clientY - rect.top) / height,
      0,
      1,
    );
  };

  const handlePointerDown = (event) => {
    updatePointerPosition(event);
    if (!followDragEnabled) {
      return;
    }

    interaction.dragging = true;
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    canvas.style.cursor = 'grabbing';
  };

  const handlePointerMove = (event) => {
    updatePointerPosition(event);
  };

  const handleWindowPointerMove = (event) => {
    updatePointerPosition(event);

    if (!interaction.dragging || !followDragEnabled) {
      return;
    }

    const deltaX = (event.clientX - interaction.pointerX) * resolvedAnimation.dragSens;
    const deltaY = (event.clientY - interaction.pointerY) * resolvedAnimation.dragSens;
    interaction.velocityX = deltaY;
    interaction.velocityY = deltaX;
    interaction.targetRotationY += deltaX;
    interaction.targetRotationX += deltaY;
    interaction.pointerX = event.clientX;
    interaction.pointerY = event.clientY;
  };

  const handlePointerLeave = () => {
    if (interaction.dragging) {
      return;
    }

    interaction.mouseX = 0.5;
    interaction.mouseY = 0.5;
  };

  const handlePointerUp = () => {
    interaction.dragging = false;
    canvas.style.cursor = followDragEnabled ? 'grab' : 'default';

    if (!resolvedAnimation.springReturnEnabled) {
      return;
    }

    const springImpulse = Math.max(resolvedAnimation.springStrength * 10, 1.2);
    interaction.rotationVelocityX += interaction.velocityX * springImpulse;
    interaction.rotationVelocityY += interaction.velocityY * springImpulse;
    interaction.rotationVelocityZ += interaction.velocityY * springImpulse * 0.12;
    interaction.targetRotationX = 0;
    interaction.targetRotationY = 0;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
  };

  const handleWindowBlur = () => {
    handlePointerUp();
    handlePointerLeave();
  };

  const handlePointerCancel = () => {
    handlePointerUp();
    handlePointerLeave();
  };

  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointercancel', handlePointerCancel);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointermove', handleWindowPointerMove);
  window.addEventListener('blur', handleWindowBlur);
  canvas.addEventListener('pointerdown', handlePointerDown);

  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;

  const renderFrame = (timestamp) => {
    animationFrameId = window.requestAnimationFrame(renderFrame);
    clock.update(timestamp);

    const delta = 1 / 60;
    const elapsedTime = resolvedInitialPose.timeElapsed + clock.getElapsed();
    halftoneMaterial.uniforms.time.value = elapsedTime;

    let baseRotationX = resolvedInitialPose.rotationX;
    let baseRotationY = resolvedInitialPose.rotationY;
    let baseRotationZ = resolvedInitialPose.rotationZ;
    let meshOffsetY = 0;
    let meshScale = 1;
    let lightAngle = settings.lighting.angleDegrees;
    let lightHeight = settings.lighting.height;

    if (autoRotateEnabled) {
      interaction.autoElapsed += delta;
      baseRotationY += interaction.autoElapsed * resolvedAnimation.autoSpeed;
      baseRotationX +=
        Math.sin(interaction.autoElapsed * 0.2) *
        resolvedAnimation.autoWobble;
    }

    if (resolvedAnimation.floatEnabled) {
      const floatPhase = elapsedTime * resolvedAnimation.floatSpeed;
      const driftAmount = (resolvedAnimation.driftAmount * Math.PI) / 180;

      meshOffsetY += Math.sin(floatPhase) * resolvedAnimation.floatAmplitude;
      baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
      baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
    }

    if (resolvedAnimation.breatheEnabled) {
      meshScale *=
        1 +
        Math.sin(elapsedTime * resolvedAnimation.breatheSpeed) *
          resolvedAnimation.breatheAmount;
    }

    if (rotateEnabled) {
      interaction.rotateElapsed += delta;
      const rotateProgress = resolvedAnimation.rotatePingPong
        ? Math.sin(interaction.rotateElapsed * resolvedAnimation.rotateSpeed) *
          Math.PI
        : interaction.rotateElapsed * resolvedAnimation.rotateSpeed;

      if (resolvedAnimation.rotatePreset === 'axis') {
        const axisDirection =
          resolvedAnimation.rotateAxis.startsWith('-') ? -1 : 1;
        const axisProgress = rotateProgress * axisDirection;

        if (
          resolvedAnimation.rotateAxis === 'x' ||
          resolvedAnimation.rotateAxis === 'xy' ||
          resolvedAnimation.rotateAxis === '-x' ||
          resolvedAnimation.rotateAxis === '-xy'
        ) {
          baseRotationX += axisProgress;
        }

        if (
          resolvedAnimation.rotateAxis === 'y' ||
          resolvedAnimation.rotateAxis === 'xy' ||
          resolvedAnimation.rotateAxis === '-y' ||
          resolvedAnimation.rotateAxis === '-xy'
        ) {
          baseRotationY += axisProgress;
        }

        if (
          resolvedAnimation.rotateAxis === 'z' ||
          resolvedAnimation.rotateAxis === '-z'
        ) {
          baseRotationZ += axisProgress;
        }
      } else if (resolvedAnimation.rotatePreset === 'lissajous') {
        baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
        baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
        baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
      } else if (resolvedAnimation.rotatePreset === 'orbit') {
        baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
        baseRotationY += Math.cos(rotateProgress) * 1.2;
        baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
      } else if (resolvedAnimation.rotatePreset === 'tumble') {
        baseRotationX += rotateProgress * 0.55;
        baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
        baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
      }
    }

    if (resolvedAnimation.lightSweepEnabled) {
      const lightPhase = elapsedTime * resolvedAnimation.lightSweepSpeed;
      lightAngle += Math.sin(lightPhase) * resolvedAnimation.lightSweepRange;
      lightHeight +=
        Math.cos(lightPhase * 0.85) *
        resolvedAnimation.lightSweepHeightRange;
    }

    let targetX = baseRotationX;
    let targetY = baseRotationY;
    let easing = 0.12;

    if (followHoverEnabled) {
      const rangeRadians = (resolvedAnimation.hoverRange * Math.PI) / 180;

      if (
        resolvedAnimation.hoverReturn ||
        interaction.mouseX !== 0.5 ||
        interaction.mouseY !== 0.5
      ) {
        targetX += (interaction.mouseY - 0.5) * rangeRadians;
        targetY += (interaction.mouseX - 0.5) * rangeRadians;
      }

      easing = resolvedAnimation.hoverEase;
    }

    if (followDragEnabled) {
      if (!interaction.dragging && resolvedAnimation.dragMomentum) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - resolvedAnimation.dragFriction;
        interaction.velocityY *= 1 - resolvedAnimation.dragFriction;
      }

      targetX += interaction.targetRotationX;
      targetY += interaction.targetRotationY;
      easing = resolvedAnimation.dragFriction;
    }

    if (autoRotateEnabled && !followHoverEnabled && !followDragEnabled) {
      targetX = baseRotationX + interaction.targetRotationX;
      targetY = baseRotationY + interaction.targetRotationY;

      if (interaction.dragging) {
        targetX = interaction.targetRotationX;
        targetY = interaction.targetRotationY;
      }

      easing = 0.08;
    }

    if (resolvedAnimation.springReturnEnabled) {
      const springX = applySpringStep(
        interaction.rotationX,
        targetX,
        interaction.rotationVelocityX,
        resolvedAnimation.springStrength,
        resolvedAnimation.springDamping,
      );
      const springY = applySpringStep(
        interaction.rotationY,
        targetY,
        interaction.rotationVelocityY,
        resolvedAnimation.springStrength,
        resolvedAnimation.springDamping,
      );
      const springZ = applySpringStep(
        interaction.rotationZ,
        baseRotationZ,
        interaction.rotationVelocityZ,
        resolvedAnimation.springStrength,
        resolvedAnimation.springDamping,
      );

      interaction.rotationX = springX.value;
      interaction.rotationY = springY.value;
      interaction.rotationZ = springZ.value;
      interaction.rotationVelocityX = springX.velocity;
      interaction.rotationVelocityY = springY.velocity;
      interaction.rotationVelocityZ = springZ.velocity;
    } else {
      interaction.rotationX += (targetX - interaction.rotationX) * easing;
      interaction.rotationY += (targetY - interaction.rotationY) * easing;
      interaction.rotationZ +=
        (baseRotationZ - interaction.rotationZ) *
        (resolvedAnimation.rotatePingPong ? 0.18 : 0.12);
    }

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );
    mesh.position.y = meshOffsetY;
    mesh.scale.setScalar(meshScale);

    if (resolvedAnimation.cameraParallaxEnabled) {
      const cameraRange = resolvedAnimation.cameraParallaxAmount;
      const cameraEase = resolvedAnimation.cameraParallaxEase;
      const centeredX = (interaction.mouseX - 0.5) * 2;
      const centeredY = (0.5 - interaction.mouseY) * 2;
      const orbitYaw = centeredX * cameraRange;
      const orbitPitch = centeredY * cameraRange * 0.7;
      const horizontalRadius = Math.cos(orbitPitch) * baseCameraDistance;
      const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
      const targetCameraY =
        Math.sin(orbitPitch) * baseCameraDistance * 0.85;
      const targetCameraZ = Math.cos(orbitYaw) * horizontalRadius;

      camera.position.x += (targetCameraX - camera.position.x) * cameraEase;
      camera.position.y += (targetCameraY - camera.position.y) * cameraEase;
      camera.position.z += (targetCameraZ - camera.position.z) * cameraEase;
    } else {
      camera.position.x += (0 - camera.position.x) * 0.12;
      camera.position.y += (0 - camera.position.y) * 0.12;
      camera.position.z += (baseCameraDistance - camera.position.z) * 0.12;
    }

    const lookAtTarget = new THREE.Vector3(0, meshOffsetY * 0.2, 0);

    camera.lookAt(lookAtTarget);
    setPrimaryLightPosition(primaryLight, lightAngle, lightHeight);
    halftoneMaterial.uniforms.footprintScale.value = getHalftoneScale(
      getVirtualWidth(),
      getVirtualHeight(),
      lookAtTarget,
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
    clock.dispose();
    resizeObserver.disconnect();
    canvas.removeEventListener('pointermove', handlePointerMove);
    canvas.removeEventListener('pointerleave', handlePointerLeave);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handleWindowPointerMove);
    window.removeEventListener('blur', handleWindowBlur);
    canvas.removeEventListener('pointerdown', handlePointerDown);
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
    material.dispose();
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    disposeHalftoneMaterialAssets(materialAssets);
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };
}


type PartnerThreeCardProps = {
  animationOverrides?: Partial<typeof settings.animation>;
  initialRotationX?: number;
  initialRotationY?: number;
  initialRotationZ?: number;
  modelUrl: string;
  style?: CSSProperties;
};

export function PartnerThreeCard({
  animationOverrides,
  initialRotationX,
  initialRotationY,
  initialRotationZ,
  modelUrl,
  style,
}: PartnerThreeCardProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountReference.current;

    if (!container) {
      return;
    }

    const unmount = mountHalftoneCanvas({
      animationOverrides,
      container,
      initialRotationX,
      initialRotationY,
      initialRotationZ,
      modelUrl,
      onError: (error) => {
        console.error(error);
      },
    });

    return () => {
      void Promise.resolve(unmount).then((dispose) => dispose?.());
    };
  }, [
    animationOverrides,
    initialRotationX,
    initialRotationY,
    initialRotationZ,
    modelUrl,
  ]);

  return (
    <div
      ref={mountReference}
      style={{
        background: "transparent",
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );
}

export default PartnerThreeCard;
