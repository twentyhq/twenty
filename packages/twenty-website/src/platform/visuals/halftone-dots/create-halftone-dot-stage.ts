import * as THREE from 'three';

import { createVisualRenderer } from '@/platform/visuals/three-runtime/create-visual-renderer';
import { paletteColorNumber } from '@/tokens';

// A 3D scene drawn as the home's halftone of dots: the `tone` scene is lit
// into grey values, then each cell of the screen becomes one blue dot sized
// by its tone. The `crisp` scene (lines, packets) is drawn sharp on top and
// hides behind the tone scene's solids. Dots swell under the cursor.
// Shared by the partner program heroes; the partners globe draws the same way.

const HALFTONE = {
  cellPx: 5,
  power: -1.8,
  dotScale: 0.82,
} as const;

const HOVER = {
  radiusPx: 140,
  lift: 0.22,
  easeIn: 0.12,
  easeOut: 0.06,
} as const;

const HALFTONE_VERTEX = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

// The site's halftone (halftone-pass-shader.ts): one sample per cell, the
// tone biased by the power; the tone sets a dot's radius, not a dash.
const HALFTONE_FRAGMENT = /* glsl */ `
  uniform sampler2D tScene; uniform vec2 effectResolution; uniform vec2 logicalResolution;
  uniform float cell; uniform float power; uniform float dotScale; uniform vec3 dotColor;
  uniform vec2 pointer; uniform float hover; uniform float hoverRadius; uniform float hoverLift;
  uniform float mixed;
  void main() {
    vec2 frag = (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;
    vec2 cellIndex = floor(frag / cell);
    vec2 sampleUv = clamp((cellIndex + 0.5) * cell / logicalResolution, vec2(0.0), vec2(1.0));
    vec4 scene = texture2D(tScene, sampleUv);
    float tone = (scene.r + scene.g + scene.b) / 3.0;
    float on = smoothstep(0.02, 0.08, scene.a);
    float near = smoothstep(hoverRadius, 0.0, distance((cellIndex + 0.5) * cell, pointer)) * hover;
    float level = clamp(tone + power * 0.2357 + near * hoverLift * on, 0.0, 1.0);
    float alpha = 0.0;
    if (level > 0.0001) {
      vec2 offset = fract(frag / cell) - 0.5;
      float r = level * dotScale;
      // mixed: light tones stay round dots; stronger tones stretch into
      // horizontal dashes that join into lines, as the site's halftone does
      float halfLength = mixed * max(0.0, level - 0.28) * 1.2;
      r = mix(r, min(r, 0.3), mixed);
      offset.x -= clamp(offset.x, -halfLength, halfLength);
      float d = length(offset);
      // one device pixel of smoothing, in cell units: a CSS pixel blurs the
      // dots on a dense screen
      float aa = 0.5 * logicalResolution.x / max(effectResolution.x, 1.0) / cell;
      alpha = (1.0 - smoothstep(r - aa, r + aa, d)) * on;
    }
    gl_FragColor = vec4(dotColor * alpha, alpha);
  }`;

// Lit into a grey value; raise `uBase` to make a solid's dots bigger.
export const createHalftoneToneMaterial = (base: number, lit: number) =>
  new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: base },
      uLit: { value: lit },
      uLight: { value: new THREE.Vector3(-0.5, 0.9, 0.45).normalize() },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uBase; uniform float uLit; uniform vec3 uLight;
      varying vec3 vNormal;
      void main() {
        float diffuse = max(dot(normalize(vNormal), uLight), 0.0);
        gl_FragColor = vec4(vec3(uBase + uLit * diffuse), 1.0);
      }`,
  });

export type HalftoneDotStage = {
  camera: THREE.PerspectiveCamera;
  tone: THREE.Scene;
  crisp: THREE.Scene;
  lineResolution: THREE.Vector2;
  // The ray under the cursor, null when the cursor is outside.
  pointerRay: () => THREE.Raycaster | null;
  // Moves an HTML element to a 3D point (CSS --x / --y / --o / --s).
  place: (
    element: HTMLElement,
    point: THREE.Vector3,
    opacity?: number,
    scale?: number,
  ) => void;
  render: () => void;
  isVisible: () => boolean;
  dispose: () => void;
};

export function createHalftoneDotStage(
  frame: HTMLElement,
  {
    fov,
    shape = 'dots',
    cellPx = HALFTONE.cellPx,
    dotColor = paletteColorNumber('blue'),
  }: {
    fov: number;
    // the dots' ink, blue unless a scene asks otherwise
    dotColor?: number;
    // 'mixed' turns the stronger tones into dashes
    shape?: 'dots' | 'mixed';
    cellPx?: number;
  },
): HalftoneDotStage | null {
  const renderer = createVisualRenderer({ alpha: true, antialias: true });
  if (renderer === null) {
    return null;
  }
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.autoClear = false;
  frame.prepend(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);
  const tone = new THREE.Scene();
  const crisp = new THREE.Scene();
  const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
  const lineResolution = new THREE.Vector2();

  const target = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
  });
  const halftone = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tScene: { value: target.texture },
      effectResolution: { value: new THREE.Vector2() },
      logicalResolution: { value: new THREE.Vector2() },
      cell: { value: cellPx },
      mixed: { value: shape === 'mixed' ? 1 : 0 },
      power: { value: HALFTONE.power },
      dotScale: { value: HALFTONE.dotScale },
      dotColor: { value: new THREE.Color(dotColor) },
      pointer: { value: new THREE.Vector2(-9999, -9999) },
      hover: { value: 0 },
      hoverRadius: { value: HOVER.radiusPx },
      hoverLift: { value: HOVER.lift },
    },
    vertexShader: HALFTONE_VERTEX,
    fragmentShader: HALFTONE_FRAGMENT,
  });
  const quadGeometry = new THREE.PlaneGeometry(2, 2);
  const quad = new THREE.Scene();
  quad.add(new THREE.Mesh(quadGeometry, halftone));
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  let width = 1;
  let height = 1;
  const resize = () => {
    width = Math.max(frame.clientWidth, 1);
    height = Math.max(frame.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    target.setSize(width * pixelRatio, height * pixelRatio);
    halftone.uniforms.effectResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
    halftone.uniforms.logicalResolution.value.set(width, height);
    lineResolution.set(width * pixelRatio, height * pixelRatio);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(frame);
  resize();

  let visible = true;
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
  });
  visibilityObserver.observe(frame);

  let hoverTarget = 0;
  let pointerInside = false;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const onPointerMove = (event: PointerEvent) => {
    const bounds = frame.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    // gl_FragCoord runs from the bottom
    halftone.uniforms.pointer.value.set(x, bounds.height - y);
    pointerNdc.set((x / bounds.width) * 2 - 1, -(y / bounds.height) * 2 + 1);
    hoverTarget = 1;
    pointerInside = true;
  };
  const onPointerLeave = () => {
    hoverTarget = 0;
    pointerInside = false;
  };
  frame.addEventListener('pointermove', onPointerMove);
  frame.addEventListener('pointerleave', onPointerLeave);

  const projected = new THREE.Vector3();
  const place: HalftoneDotStage['place'] = (
    element,
    point,
    opacity = 1,
    scale = 1,
  ) => {
    if (opacity < 0.01) {
      element.style.display = 'none';
      return;
    }
    projected.copy(point).project(camera);
    element.style.display = 'block';
    element.style.setProperty(
      '--x',
      `${((projected.x * 0.5 + 0.5) * width).toFixed(1)}px`,
    );
    element.style.setProperty(
      '--y',
      `${((-projected.y * 0.5 + 0.5) * height).toFixed(1)}px`,
    );
    element.style.setProperty('--o', opacity.toFixed(3));
    element.style.setProperty('--s', scale.toFixed(3));
  };

  const render = () => {
    const hover = halftone.uniforms.hover;
    hover.value +=
      (hoverTarget - hover.value) *
      (hoverTarget > hover.value ? HOVER.easeIn : HOVER.easeOut);
    renderer.setRenderTarget(target);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(tone, camera);
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(quad, quadCamera);
    // the tone scene's depth, so crisp lines hide behind its solids
    tone.overrideMaterial = depthOnly;
    renderer.render(tone, camera);
    tone.overrideMaterial = null;
    renderer.render(crisp, camera);
  };

  const disposeScene = (scene: THREE.Scene) =>
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });

  return {
    camera,
    tone,
    crisp,
    lineResolution,
    pointerRay: () => {
      if (!pointerInside) return null;
      raycaster.setFromCamera(pointerNdc, camera);
      return raycaster;
    },
    place,
    render,
    isVisible: () => visible,
    dispose: () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      frame.removeEventListener('pointermove', onPointerMove);
      frame.removeEventListener('pointerleave', onPointerLeave);
      disposeScene(tone);
      disposeScene(crisp);
      quadGeometry.dispose();
      halftone.dispose();
      depthOnly.dispose();
      target.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
