// @ts-nocheck
'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import * as THREE from 'three';
import { styled } from '@linaria/react';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createSiteWebGlRenderer } from '@/lib/visual-runtime';
import { GLASS_ENVIRONMENT_TEXTURE_URL } from '@/lib/visual-runtime/textures/glass-environment';
import { DRACO_DECODER_PATH } from '@/lib/visual-runtime/draco-decoder-path';

const settings = {
  sourceMode: 'shape',
  shapeKey: 'userUpload_1776153228532',
  lighting: {
    intensity: 0.5,
    fillIntensity: 0,
    ambientIntensity: 0,
    angleDegrees: 80,
    height: -4,
  },
  material: {
    surface: 'solid',
    color: '#F5F5F5',
    roughness: 0.4,
    metalness: 0.1,
    thickness: 150,
    refraction: 2,
    environmentPower: 5,
  },
  halftone: {
    enabled: true,
    scale: 12,
    power: 0.1,
    width: 0.6,
    imageContrast: 1,
    dashColor: '#4A38F5',
    hoverDashColor: '#4A38F5',
  },
  background: {
    transparent: true,
    color: '#F4F4F4',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: true,
    floatEnabled: false,
    hoverHalftoneEnabled: false,
    hoverLightEnabled: false,
    dragFlowEnabled: false,
    lightSweepEnabled: false,
    rotateEnabled: false,
    autoSpeed: 0.01,
    autoWobble: 0.2,
    breatheAmount: 0.04,
    breatheSpeed: 0.8,
    cameraParallaxAmount: 0.3,
    cameraParallaxEase: 0.08,
    driftAmount: 8,
    hoverRange: 25,
    hoverEase: 0.08,
    hoverReturn: true,
    dragSens: 0.008,
    dragFriction: 0.08,
    dragMomentum: true,
    rotateAxis: 'y',
    rotatePreset: 'axis',
    rotateSpeed: 0.1,
    rotatePingPong: false,
    floatAmplitude: 0.16,
    floatSpeed: 0.8,
    lightSweepHeightRange: 0.5,
    lightSweepRange: 28,
    lightSweepSpeed: 0.7,
    springDamping: 0.52,
    springReturnEnabled: true,
    springStrength: 0.2,
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.2,
    hoverHalftoneWidthShift: -0.18,
    hoverLightIntensity: 0.8,
    hoverLightRadius: 0.2,
    dragFlowDecay: 0.08,
    dragFlowRadius: 0.24,
    dragFlowStrength: 1.8,
    hoverWarpStrength: 3,
    hoverWarpRadius: 0.15,
    dragWarpStrength: 5,
    waveEnabled: false,
    waveSpeed: 1,
    waveAmount: 2,
  },
};
const shape = {
  filename: 'hero.glb',
  key: 'userUpload_1776153228532',
  kind: 'imported',
  label: 'hero.glb',
  loader: 'glb',
};
const initialPose = {
  autoElapsed: 0,
  rotateElapsed: 0,
  rotationX: 0.4,
  rotationY: 0,
  rotationZ: 0.6,
  targetRotationX: 0,
  targetRotationY: 0,
  timeElapsed: 0,
};
const previewDistance = 2.5;
const VIRTUAL_RENDER_HEIGHT = 400;
const passThroughVertexShader =
  '\n  varying vec2 vUv;\n\n  void main() {\n    vUv = uv;\n    gl_Position = vec4(position, 1.0);\n  }\n';
const blurFragmentShader =
  '\n  precision highp float;\n\n  uniform sampler2D tInput;\n  uniform vec2 dir;\n  uniform vec2 res;\n\n  varying vec2 vUv;\n\n  void main() {\n    vec4 sum = vec4(0.0);\n    vec2 px = dir / res;\n\n    float w[5];\n    w[0] = 0.227027;\n    w[1] = 0.1945946;\n    w[2] = 0.1216216;\n    w[3] = 0.054054;\n    w[4] = 0.016216;\n\n    sum += texture2D(tInput, vUv) * w[0];\n\n    for (int i = 1; i < 5; i++) {\n      float fi = float(i) * 3.0;\n      sum += texture2D(tInput, vUv + px * fi) * w[i];\n      sum += texture2D(tInput, vUv - px * fi) * w[i];\n    }\n\n    gl_FragColor = sum;\n  }\n';
const halftoneFragmentShader =
  '\n  precision highp float;\n\n  uniform sampler2D tScene;\n  uniform sampler2D tGlow;\n  uniform vec2 effectResolution;\n  uniform vec2 logicalResolution;\n  uniform float tile;\n  uniform float s_3;\n  uniform float s_4;\n  uniform vec3 dashColor;\n  uniform vec3 hoverDashColor;\n  uniform float time;\n  uniform float waveAmount;\n  uniform float waveSpeed;\n  uniform float footprintScale;\n  uniform vec2 interactionUv;\n  uniform vec2 interactionVelocity;\n  uniform vec2 dragOffset;\n  uniform float hoverHalftoneActive;\n  uniform float hoverHalftonePowerShift;\n  uniform float hoverHalftoneRadius;\n  uniform float hoverHalftoneWidthShift;\n  uniform float hoverLightStrength;\n  uniform float hoverLightRadius;\n  uniform float hoverFlowStrength;\n  uniform float hoverFlowRadius;\n  uniform float dragFlowStrength;\n  uniform float cropToBounds;\n\n  varying vec2 vUv;\n\n  float distSegment(in vec2 p, in vec2 a, in vec2 b) {\n    vec2 pa = p - a;\n    vec2 ba = b - a;\n    float denom = max(dot(ba, ba), 0.000001);\n    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);\n    return length(pa - ba * h);\n  }\n\n  float lineSimpleEt(in vec2 p, in float r, in float thickness) {\n    vec2 a = vec2(0.5) + vec2(-r, 0.0);\n    vec2 b = vec2(0.5) + vec2(r, 0.0);\n    float distToSegment = distSegment(p, a, b);\n    float halfThickness = thickness * r;\n    return distToSegment - halfThickness;\n  }\n\n  void main() {\n    if (cropToBounds > 0.5) {\n      vec4 boundsCheck = texture2D(tScene, vUv);\n      if (boundsCheck.a < 0.01) {\n        gl_FragColor = vec4(0.0);\n        return;\n      }\n    }\n\n    vec2 fragCoord =\n      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;\n    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);\n    vec2 pointerPx = interactionUv * logicalResolution;\n    vec2 fragDelta = fragCoord - pointerPx;\n    float fragDist = length(fragDelta);\n    vec2 radialDir = fragDist > 0.001 ? fragDelta / fragDist : vec2(0.0, 1.0);\n    float velocityMagnitude = length(interactionVelocity);\n    vec2 motionDir = velocityMagnitude > 0.001\n      ? interactionVelocity / velocityMagnitude\n      : vec2(0.0, 0.0);\n    float motionBias = velocityMagnitude > 0.001\n      ? dot(-radialDir, motionDir) * 0.5 + 0.5\n      : 0.5;\n\n    float hoverLightMask = 0.0;\n    if (hoverLightStrength > 0.0) {\n      float lightRadiusPx = hoverLightRadius * logicalResolution.y;\n      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);\n    }\n\n    float hoverHalftoneMask = 0.0;\n    if (hoverHalftoneActive > 0.0) {\n      float hoverHalftoneRadiusPx = hoverHalftoneRadius * logicalResolution.y;\n      hoverHalftoneMask = smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist);\n    }\n\n    float hoverFlowMask = 0.0;\n    if (hoverFlowStrength > 0.0) {\n      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;\n      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);\n    }\n\n    vec2 hoverDisplacement =\n      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +\n      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * halftoneSize * 1.15;\n    vec2 travelDisplacement = dragOffset * dragFlowStrength * 0.45;\n    vec2 effectCoord = fragCoord + hoverDisplacement + travelDisplacement;\n\n    float bandRow = floor(effectCoord.y / halftoneSize);\n    float waveOffset =\n      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;\n    effectCoord.x += waveOffset;\n\n    vec2 cellIndex = floor(effectCoord / halftoneSize);\n    vec2 sampleUv = clamp(\n      (cellIndex + 0.5) * halftoneSize / logicalResolution,\n      vec2(0.0),\n      vec2(1.0)\n    );\n    vec2 cellUv = fract(effectCoord / halftoneSize);\n\n    vec4 sceneSample = texture2D(tScene, sampleUv);\n    float mask = smoothstep(0.02, 0.08, sceneSample.a);\n    float localPower = clamp(\n      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,\n      -1.5,\n      1.5\n    );\n    float localWidth = clamp(\n      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,\n      0.05,\n      1.4\n    );\n    float lightLift =\n      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;\n    float bandRadius = clamp(\n      (\n        (\n          sceneSample.r +\n          sceneSample.g +\n          sceneSample.b +\n          localPower * length(vec2(0.5))\n        ) *\n        (1.0 / 3.0)\n      ) + lightLift,\n      0.0,\n      1.0\n    ) * 1.86 * 0.5;\n\n    float alpha = 0.0;\n    if (bandRadius > 0.0001) {\n      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);\n      float edge = 0.02;\n      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;\n    }\n\n    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);\n    vec3 color = activeDashColor * alpha;\n    gl_FragColor = vec4(color, alpha);\n\n    #include <tonemapping_fragment>\n    #include <colorspace_fragment>\n  }\n';

const REFERENCE_PREVIEW_DISTANCE = 4;
const MIN_FOOTPRINT_SCALE = 0.001;

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

  return Math.max(Math.sqrt(currentArea / referenceArea), MIN_FOOTPRINT_SCALE);
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
  if (localBounds.isEmpty() || viewportWidth <= 0 || viewportHeight <= 0) {
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
    for (
      let vertexIndex = 0;
      vertexIndex < geometryInfo.vertexCount;
      vertexIndex += 1
    ) {
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
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
        indices[indexOffset + localIndex] =
          geometryInfo.index.getX(localIndex) + vertexOffset;
      }
    } else {
      for (
        let localIndex = 0;
        localIndex < geometryInfo.indexCount;
        localIndex += 1
      ) {
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

  const bump = new THREE.SphereGeometry(
    0.32,
    32,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2,
  );
  bump.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  bump.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, baseDepth / 2));
  targetParts.push(bump);

  const shaftLength = 1.5;
  const shaftRadius = 0.05;
  const shaft = new THREE.CylinderGeometry(
    shaftRadius,
    shaftRadius,
    shaftLength,
    10,
    1,
  );
  shaft.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, shaftLength / 2, 0),
  );
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

    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.05, 0, -0.006),
    );
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeRotationY((finIndex * Math.PI * 2) / 3),
    );
    finGeometry.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0, shaftLength - 0.45, 0),
    );
    arrowParts.push(finGeometry);
  }

  const nock = new THREE.SphereGeometry(0.065, 8, 8);
  nock.applyMatrix4(
    new THREE.Matrix4().makeTranslation(0, shaftLength + 0.03, 0),
  );
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

    const topArc = new THREE.TorusGeometry(
      curveRadius,
      tubeRadius,
      16,
      32,
      Math.PI,
    );
    topArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(0.05, verticalOffset, 0),
    );
    geometries.push(topArc);

    const bottomArc = new THREE.TorusGeometry(
      curveRadius,
      tubeRadius,
      16,
      32,
      Math.PI,
    );
    bottomArc.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
    bottomArc.applyMatrix4(
      new THREE.Matrix4().makeTranslation(-0.05, -verticalOffset, 0),
    );
    geometries.push(bottomArc);

    const topSerif = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      0.22,
      12,
    );
    topSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    topSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        0.16,
        verticalOffset + curveRadius,
        0,
      ),
    );
    geometries.push(topSerif);

    const bottomSerif = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      0.22,
      12,
    );
    bottomSerif.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
    bottomSerif.applyMatrix4(
      new THREE.Matrix4().makeTranslation(
        -0.16,
        -verticalOffset - curveRadius,
        0,
      ),
    );
    geometries.push(bottomSerif);

    const diagonalLength = Math.sqrt(0.1 * 0.1 + (verticalOffset * 2) ** 2);
    const diagonalAngle = Math.atan2(verticalOffset * 2, 0.1);
    const diagonal = new THREE.CylinderGeometry(
      tubeRadius,
      tubeRadius,
      diagonalLength + 0.12,
      12,
    );
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
        makePolarShape(
          (angle) => 0.88 + 0.3 * Math.pow(Math.sin(angle * 4), 2),
        ),
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

function normalizeImportedGeometry(geometry) {
  geometry.computeBoundingBox();

  let boundingBox = geometry.boundingBox;
  let center = new THREE.Vector3();
  let size = new THREE.Vector3();

  boundingBox?.getCenter(center);
  boundingBox?.getSize(size);
  geometry.translate(-center.x, -center.y, -center.z);

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

function parseGlbGeometry(buffer, label) {
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

async function loadImportedGeometryFromUrl(modelUrl, label) {
  const response = await fetch(modelUrl);

  if (!response.ok) {
    throw new Error('Unable to load ' + label + ' from ' + modelUrl + '.');
  }

  const buffer = await response.arrayBuffer();

  return parseGlbGeometry(buffer, label);
}

const GLASS_THICKNESS_TO_WORLD_UNITS = 1 / 320;
const GLASS_ATTENUATION_DISTANCE_MIN = 0.12;
const GLASS_ENVIRONMENT_INTENSITY_BASE = 0.18;
const GLASS_ENVIRONMENT_INTENSITY_MULTIPLIER = 0.12;
const GLASS_ENVIRONMENT_ZOOM = 1.55;
const GLASS_TRANSMISSION_BACKGROUND = new THREE.Color(0x030303);
const MAX_TEXTURE_ANISOTROPY = 8;
const HALFTONE_TRANSMISSION_SHADER_PREFIX =
  '\nuniform float chromaticAberration;\nuniform float anisotropicBlur;\nuniform float time;\nuniform float distortion;\nuniform float distortionScale;\nuniform float temporalDistortion;\nuniform sampler2D buffer;\n\nvec3 random3(vec3 c) {\n  float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));\n  vec3 r;\n  r.z = fract(512.0 * j);\n  j *= 0.125;\n  r.x = fract(512.0 * j);\n  j *= 0.125;\n  r.y = fract(512.0 * j);\n  return r - 0.5;\n}\n\nuint hash(uint x) {\n  x += (x << 10u);\n  x ^= (x >> 6u);\n  x += (x << 3u);\n  x ^= (x >> 11u);\n  x += (x << 15u);\n  return x;\n}\n\nuint hash(uvec2 v) { return hash(v.x ^ hash(v.y)); }\nuint hash(uvec3 v) { return hash(v.x ^ hash(v.y) ^ hash(v.z)); }\nuint hash(uvec4 v) {\n  return hash(v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w));\n}\n\nfloat floatConstruct(uint m) {\n  const uint ieeeMantissa = 0x007FFFFFu;\n  const uint ieeeOne = 0x3F800000u;\n  m &= ieeeMantissa;\n  m |= ieeeOne;\n  float f = uintBitsToFloat(m);\n  return f - 1.0;\n}\n\nfloat randomBase(float x) {\n  return floatConstruct(hash(floatBitsToUint(x)));\n}\nfloat randomBase(vec2 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\nfloat randomBase(vec3 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\nfloat randomBase(vec4 v) {\n  return floatConstruct(hash(floatBitsToUint(v)));\n}\n\nfloat rand(float seed) {\n  return randomBase(vec3(gl_FragCoord.xy, seed));\n}\n\nconst float F3 = 0.3333333;\nconst float G3 = 0.1666667;\n\nfloat snoise(vec3 p) {\n  vec3 s = floor(p + dot(p, vec3(F3)));\n  vec3 x = p - s + dot(s, vec3(G3));\n  vec3 e = step(vec3(0.0), x - x.yzx);\n  vec3 i1 = e * (1.0 - e.zxy);\n  vec3 i2 = 1.0 - e.zxy * (1.0 - e);\n  vec3 x1 = x - i1 + G3;\n  vec3 x2 = x - i2 + 2.0 * G3;\n  vec3 x3 = x - 1.0 + 3.0 * G3;\n  vec4 w;\n  vec4 d;\n  w.x = dot(x, x);\n  w.y = dot(x1, x1);\n  w.z = dot(x2, x2);\n  w.w = dot(x3, x3);\n  w = max(0.6 - w, 0.0);\n  d.x = dot(random3(s), x);\n  d.y = dot(random3(s + i1), x1);\n  d.z = dot(random3(s + i2), x2);\n  d.w = dot(random3(s + 1.0), x3);\n  w *= w;\n  w *= w;\n  d *= w;\n  return dot(d, vec4(52.0));\n}\n\nfloat snoiseFractal(vec3 m) {\n  return 0.5333333 * snoise(m)\n    + 0.2666667 * snoise(2.0 * m)\n    + 0.1333333 * snoise(4.0 * m)\n    + 0.0666667 * snoise(8.0 * m);\n}\n';
const HALFTONE_TRANSMISSION_PARS_FRAGMENT =
  '\n#ifdef USE_TRANSMISSION\n  uniform float _transmission;\n  uniform float thickness;\n  uniform float attenuationDistance;\n  uniform vec3 attenuationColor;\n  uniform sampler2D refractionEnvMap;\n  uniform float useEnvMapRefraction;\n  #ifdef USE_TRANSMISSIONMAP\n    uniform sampler2D transmissionMap;\n  #endif\n  #ifdef USE_THICKNESSMAP\n    uniform sampler2D thicknessMap;\n  #endif\n  uniform vec2 transmissionSamplerSize;\n  uniform sampler2D transmissionSamplerMap;\n  uniform mat4 modelMatrix;\n  uniform mat4 projectionMatrix;\n  varying vec3 vWorldPosition;\n\n  vec3 getVolumeTransmissionRay(\n    const in vec3 n,\n    const in vec3 v,\n    const in float thicknessValue,\n    const in float ior,\n    const in mat4 modelMatrix\n  ) {\n    vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);\n    vec3 modelScale;\n    modelScale.x = length(vec3(modelMatrix[0].xyz));\n    modelScale.y = length(vec3(modelMatrix[1].xyz));\n    modelScale.z = length(vec3(modelMatrix[2].xyz));\n    return normalize(refractionVector) * thicknessValue * modelScale;\n  }\n\n  float applyIorToRoughness(\n    const in float roughnessValue,\n    const in float ior\n  ) {\n    return roughnessValue * clamp(ior * 2.0 - 2.0, 0.0, 1.0);\n  }\n\n  vec2 directionToEquirectUv(const in vec3 direction) {\n    vec3 dir = normalize(direction);\n    vec2 uv = vec2(\n      atan(dir.z, dir.x) * 0.15915494309189535 + 0.5,\n      asin(clamp(dir.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5\n    );\n\n    return vec2(fract(uv.x), 1.0 - clamp(uv.y, 0.0, 1.0));\n  }\n\n  vec4 getTransmissionSample(\n    const in vec2 fragCoord,\n    const in vec3 transmissionDirection,\n    const in float roughnessValue,\n    const in float ior\n  ) {\n    if (useEnvMapRefraction > 0.5) {\n      return texture2D(\n        refractionEnvMap,\n        directionToEquirectUv(transmissionDirection)\n      );\n    }\n\n    float framebufferLod =\n      log2(transmissionSamplerSize.x) *\n      applyIorToRoughness(roughnessValue, ior);\n    return texture2D(buffer, fragCoord.xy);\n  }\n\n  vec3 applyVolumeAttenuation(\n    const in vec3 radiance,\n    const in float transmissionDistance,\n    const in vec3 attenuationColorValue,\n    const in float attenuationDistanceValue\n  ) {\n    if (isinf(attenuationDistanceValue)) {\n      return radiance;\n    }\n\n    vec3 attenuationCoefficient =\n      -log(attenuationColorValue) / attenuationDistanceValue;\n    vec3 transmittance =\n      exp(-attenuationCoefficient * transmissionDistance);\n\n    return transmittance * radiance;\n  }\n\n  vec4 getIBLVolumeRefraction(\n    const in vec3 n,\n    const in vec3 v,\n    const in float roughnessValue,\n    const in vec3 diffuseColor,\n    const in vec3 specularColor,\n    const in float specularF90,\n    const in vec3 position,\n    const in mat4 modelMatrix,\n    const in mat4 viewMatrix,\n    const in mat4 projMatrix,\n    const in float ior,\n    const in float thicknessValue,\n    const in vec3 attenuationColorValue,\n    const in float attenuationDistanceValue\n  ) {\n    vec3 transmissionRay = getVolumeTransmissionRay(\n      n,\n      v,\n      thicknessValue,\n      ior,\n      modelMatrix\n    );\n    vec3 refractedRayExit = position + transmissionRay;\n    vec4 ndcPos =\n      projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);\n    vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n    refractionCoords += 1.0;\n    refractionCoords /= 2.0;\n    vec3 transmissionDirection = normalize(transmissionRay);\n    vec4 transmittedLight = getTransmissionSample(\n      refractionCoords,\n      transmissionDirection,\n      roughnessValue,\n      ior\n    );\n    vec3 attenuatedColor = applyVolumeAttenuation(\n      transmittedLight.rgb,\n      length(transmissionRay),\n      attenuationColorValue,\n      attenuationDistanceValue\n    );\n    vec3 F = EnvironmentBRDF(\n      n,\n      v,\n      specularColor,\n      specularF90,\n      roughnessValue\n    );\n    return vec4(\n      (1.0 - F) * attenuatedColor * diffuseColor,\n      transmittedLight.a\n    );\n  }\n#endif\n';
const HALFTONE_TRANSMISSION_FRAGMENT_TEMPLATE =
  '\nmaterial.transmission = _transmission;\nmaterial.transmissionAlpha = 1.0;\nmaterial.thickness = thickness;\nmaterial.attenuationDistance = attenuationDistance;\nmaterial.attenuationColor = attenuationColor;\n#ifdef USE_TRANSMISSIONMAP\n  material.transmission *= texture2D(transmissionMap, vUv).r;\n#endif\n#ifdef USE_THICKNESSMAP\n  material.thickness *= texture2D(thicknessMap, vUv).g;\n#endif\n\nvec3 pos = vWorldPosition;\nfloat runningSeed = 0.0;\nvec3 v = normalize(cameraPosition - pos);\nvec3 n = inverseTransformDirection(normal, viewMatrix);\nvec3 transmission = vec3(0.0);\nfloat transmissionR;\nfloat transmissionG;\nfloat transmissionB;\nfloat randomCoords = rand(runningSeed++);\nfloat thicknessSmear =\n  thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);\nvec3 distortionNormal = vec3(0.0);\nvec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;\n\nif (distortion > 0.0) {\n  distortionNormal = distortion * vec3(\n    snoiseFractal(vec3(pos * distortionScale + temporalOffset)),\n    snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)),\n    snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset))\n  );\n}\n\nfor (float i = 0.0; i < __SAMPLES__.0; i++) {\n  vec3 sampleNorm = normalize(\n    n +\n    roughnessFactor * roughnessFactor * 2.0 *\n    normalize(\n      vec3(\n        rand(runningSeed++) - 0.5,\n        rand(runningSeed++) - 0.5,\n        rand(runningSeed++) - 0.5\n      )\n    ) *\n    pow(rand(runningSeed++), 0.33) +\n    distortionNormal\n  );\n\n  transmissionR = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior,\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).r;\n\n  transmissionG = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior * (1.0 + chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).g;\n\n  transmissionB = getIBLVolumeRefraction(\n    sampleNorm,\n    v,\n    material.roughness,\n    material.diffuseColor,\n    material.specularColor,\n    material.specularF90,\n    pos,\n    modelMatrix,\n    viewMatrix,\n    projectionMatrix,\n    material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(__SAMPLES__)),\n    material.thickness + thicknessSmear * (i + randomCoords) / float(__SAMPLES__),\n    material.attenuationColor,\n    material.attenuationDistance\n  ).b;\n\n  transmission.r += transmissionR;\n  transmission.g += transmissionG;\n  transmission.b += transmissionB;\n}\n\ntransmission /= __SAMPLES__.0;\ntotalDiffuse = mix(totalDiffuse, transmission.rgb, material.transmission);\n';

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
    GLASS_ENVIRONMENT_TEXTURE_URL,
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

function applyHalftoneMaterialSettings(
  material,
  materialSettings,
  materialAssets,
) {
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
  material.refractionEnvMap = isGlass
    ? materialAssets.glassBackgroundTexture
    : null;
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
  material.attenuationDistance = isGlass ? glassAttenuationDistance : Infinity;
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

  if (
    materialAssets.glassEnvironmentTexture !==
    materialAssets.glassBackgroundTexture
  ) {
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

function createInteractionState() {
  return {
    autoElapsed: initialPose.autoElapsed,
    activePointerId: null,
    dragging: false,
    mouseX: 0.5,
    mouseY: 0.5,
    pointerInside: false,
    pointerVelocityX: 0,
    pointerVelocityY: 0,
    pointerX: 0,
    pointerY: 0,
    rotateElapsed: initialPose.rotateElapsed,
    rotationX: initialPose.rotationX,
    rotationVelocityX: 0,
    rotationY: initialPose.rotationY,
    rotationVelocityY: 0,
    rotationZ: initialPose.rotationZ,
    rotationVelocityZ: 0,
    smoothedMouseX: 0.5,
    smoothedMouseY: 0.5,
    targetRotationX: initialPose.targetRotationX,
    targetRotationY: initialPose.targetRotationY,
    velocityX: 0,
    velocityY: 0,
  };
}

function setPrimaryLightPosition(light, angleDegrees, height) {
  const lightAngle = (angleDegrees * Math.PI) / 180;
  light.position.set(
    Math.cos(lightAngle) * 5,
    height,
    Math.sin(lightAngle) * 5,
  );
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

async function createGeometry(modelUrl) {
  if (shape.kind === 'imported') {
    if (!modelUrl) {
      throw new Error('No model URL was provided for ' + shape.label + '.');
    }

    return loadImportedGeometryFromUrl(modelUrl, shape.label);
  }

  return createBuiltinGeometry(shape.key);
}

async function mountHalftoneCanvas(options) {
  const { container, modelUrl, onError } = options;

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
    return () => {};
  }

  const renderer = createSiteWebGlRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = settings.animation.followDragEnabled
    ? 'grab'
    : 'default';
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);

  const materialAssets = await createHalftoneMaterialAssets(renderer);

  const scene3d = new THREE.Scene();
  scene3d.background = null;

  const baseCameraDistance = previewDistance;
  const camera = new THREE.PerspectiveCamera(
    45,
    getWidth() / getHeight(),
    0.1,
    100,
  );
  camera.position.z = baseCameraDistance;

  const primaryLight = new THREE.DirectionalLight(
    0xffffff,
    settings.lighting.intensity,
  );
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
  blurVerticalScene.add(
    new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial),
  );

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

  const interaction = createInteractionState();
  const autoRotateEnabled = settings.animation.autoRotateEnabled;
  const followHoverEnabled = settings.animation.followHoverEnabled;
  const followDragEnabled = settings.animation.followDragEnabled;
  const rotateEnabled = settings.animation.rotateEnabled;

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

    const deltaX =
      (event.clientX - interaction.pointerX) * settings.animation.dragSens;
    const deltaY =
      (event.clientY - interaction.pointerY) * settings.animation.dragSens;
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

    if (!settings.animation.springReturnEnabled) {
      return;
    }

    const springImpulse = Math.max(settings.animation.springStrength * 10, 1.2);
    interaction.rotationVelocityX += interaction.velocityX * springImpulse;
    interaction.rotationVelocityY += interaction.velocityY * springImpulse;
    interaction.rotationVelocityZ +=
      interaction.velocityY * springImpulse * 0.12;
    interaction.targetRotationX = 0;
    interaction.targetRotationY = 0;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
  };

  const handlePointerCancel = () => {
    interaction.dragging = false;
    interaction.velocityX = 0;
    interaction.velocityY = 0;
    canvas.style.cursor = followDragEnabled ? 'grab' : 'default';
    handlePointerLeave();
  };

  const handleWindowBlur = () => {
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
    const elapsedTime = initialPose.timeElapsed + clock.getElapsed();
    halftoneMaterial.uniforms.time.value = elapsedTime;

    let baseRotationX = initialPose.rotationX;
    let baseRotationY = initialPose.rotationY;
    let baseRotationZ = initialPose.rotationZ;
    let meshOffsetY = 0;
    let meshScale = 1;
    let lightAngle = settings.lighting.angleDegrees;
    let lightHeight = settings.lighting.height;

    if (autoRotateEnabled) {
      interaction.autoElapsed += delta;
      baseRotationY += interaction.autoElapsed * settings.animation.autoSpeed;
      baseRotationX +=
        Math.sin(interaction.autoElapsed * 0.2) * settings.animation.autoWobble;
    }

    if (settings.animation.floatEnabled) {
      const floatPhase = elapsedTime * settings.animation.floatSpeed;
      const driftAmount = (settings.animation.driftAmount * Math.PI) / 180;

      meshOffsetY += Math.sin(floatPhase) * settings.animation.floatAmplitude;
      baseRotationX += Math.sin(floatPhase * 0.72) * driftAmount * 0.45;
      baseRotationZ += Math.cos(floatPhase * 0.93) * driftAmount * 0.3;
    }

    if (settings.animation.breatheEnabled) {
      meshScale *=
        1 +
        Math.sin(elapsedTime * settings.animation.breatheSpeed) *
          settings.animation.breatheAmount;
    }

    if (rotateEnabled) {
      interaction.rotateElapsed += delta;
      const rotateProgress = settings.animation.rotatePingPong
        ? Math.sin(interaction.rotateElapsed * settings.animation.rotateSpeed) *
          Math.PI
        : interaction.rotateElapsed * settings.animation.rotateSpeed;

      if (settings.animation.rotatePreset === 'axis') {
        const axisDirection = settings.animation.rotateAxis.startsWith('-')
          ? -1
          : 1;
        const axisProgress = rotateProgress * axisDirection;

        if (
          settings.animation.rotateAxis === 'x' ||
          settings.animation.rotateAxis === 'xy' ||
          settings.animation.rotateAxis === '-x' ||
          settings.animation.rotateAxis === '-xy'
        ) {
          baseRotationX += axisProgress;
        }

        if (
          settings.animation.rotateAxis === 'y' ||
          settings.animation.rotateAxis === 'xy' ||
          settings.animation.rotateAxis === '-y' ||
          settings.animation.rotateAxis === '-xy'
        ) {
          baseRotationY += axisProgress;
        }

        if (
          settings.animation.rotateAxis === 'z' ||
          settings.animation.rotateAxis === '-z'
        ) {
          baseRotationZ += axisProgress;
        }
      } else if (settings.animation.rotatePreset === 'lissajous') {
        baseRotationX += Math.sin(rotateProgress * 0.85) * 0.65;
        baseRotationY += Math.sin(rotateProgress * 1.35 + 0.8) * 1.05;
        baseRotationZ += Math.sin(rotateProgress * 0.55 + 1.6) * 0.32;
      } else if (settings.animation.rotatePreset === 'orbit') {
        baseRotationX += Math.sin(rotateProgress * 0.75) * 0.42;
        baseRotationY += Math.cos(rotateProgress) * 1.2;
        baseRotationZ += Math.sin(rotateProgress * 1.25) * 0.24;
      } else if (settings.animation.rotatePreset === 'tumble') {
        baseRotationX += rotateProgress * 0.55;
        baseRotationY += Math.sin(rotateProgress * 0.8) * 0.9;
        baseRotationZ += Math.cos(rotateProgress * 1.1) * 0.38;
      }
    }

    if (settings.animation.lightSweepEnabled) {
      const lightPhase = elapsedTime * settings.animation.lightSweepSpeed;
      lightAngle += Math.sin(lightPhase) * settings.animation.lightSweepRange;
      lightHeight +=
        Math.cos(lightPhase * 0.85) * settings.animation.lightSweepHeightRange;
    }

    let targetX = baseRotationX;
    let targetY = baseRotationY;
    let easing = 0.12;

    if (followHoverEnabled) {
      const rangeRadians = (settings.animation.hoverRange * Math.PI) / 180;

      if (
        settings.animation.hoverReturn ||
        interaction.mouseX !== 0.5 ||
        interaction.mouseY !== 0.5
      ) {
        targetX += (interaction.mouseY - 0.5) * rangeRadians;
        targetY += (interaction.mouseX - 0.5) * rangeRadians;
      }

      easing = settings.animation.hoverEase;
    }

    if (followDragEnabled) {
      if (!interaction.dragging && settings.animation.dragMomentum) {
        interaction.targetRotationX += interaction.velocityX;
        interaction.targetRotationY += interaction.velocityY;
        interaction.velocityX *= 1 - settings.animation.dragFriction;
        interaction.velocityY *= 1 - settings.animation.dragFriction;
      }

      targetX += interaction.targetRotationX;
      targetY += interaction.targetRotationY;
      easing = settings.animation.dragFriction;
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

    if (settings.animation.springReturnEnabled) {
      const springX = applySpringStep(
        interaction.rotationX,
        targetX,
        interaction.rotationVelocityX,
        settings.animation.springStrength,
        settings.animation.springDamping,
      );
      const springY = applySpringStep(
        interaction.rotationY,
        targetY,
        interaction.rotationVelocityY,
        settings.animation.springStrength,
        settings.animation.springDamping,
      );
      const springZ = applySpringStep(
        interaction.rotationZ,
        baseRotationZ,
        interaction.rotationVelocityZ,
        settings.animation.springStrength,
        settings.animation.springDamping,
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
        (settings.animation.rotatePingPong ? 0.18 : 0.12);
    }

    mesh.rotation.set(
      interaction.rotationX,
      interaction.rotationY,
      interaction.rotationZ,
    );
    mesh.position.y = meshOffsetY;
    mesh.scale.setScalar(meshScale);

    if (settings.animation.cameraParallaxEnabled) {
      const cameraRange = settings.animation.cameraParallaxAmount;
      const cameraEase = settings.animation.cameraParallaxEase;
      const centeredX = (interaction.mouseX - 0.5) * 2;
      const centeredY = (0.5 - interaction.mouseY) * 2;
      const orbitYaw = centeredX * cameraRange;
      const orbitPitch = centeredY * cameraRange * 0.7;
      const horizontalRadius = Math.cos(orbitPitch) * baseCameraDistance;
      const targetCameraX = Math.sin(orbitYaw) * horizontalRadius;
      const targetCameraY = Math.sin(orbitPitch) * baseCameraDistance * 0.85;
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
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handleWindowPointerMove);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
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

const StyledVisualMount = styled.div`
  background: transparent;
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type ProductEffectProps = {
  modelUrl?: string;
  style?: CSSProperties;
};

export function ProductEffect({
  modelUrl = '/illustrations/product/hero/hero.glb',
  style,
}: ProductEffectProps) {
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

  return <StyledVisualMount aria-hidden ref={mountReference} style={style} />;
}

export default ProductEffect;
