// Composable string-returning functions for the exported mount scripts.
// Used by createMountScript() and createImageMountScript() to avoid
// maintaining parallel blocks of identical runtime JavaScript.

export function emitSizingHelpers() {
  return `
  const getWidth = () => Math.max(container.clientWidth, 1);
  const getHeight = () => Math.max(container.clientHeight, 1);
  const getVirtualHeight = () => Math.max(VIRTUAL_RENDER_HEIGHT, getHeight());
  const getVirtualWidth = () =>
    Math.max(
      Math.round(getVirtualHeight() * (getWidth() / Math.max(getHeight(), 1))),
      1,
    );`;
}

export function emitRendererSetup(cursor: string) {
  return `
  // boundary-allow-next-line:no-raw-webgl-renderer -- emitted into the standalone HTML export; runs in the user's downloaded file with no access to lib/visual-runtime
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(getVirtualWidth(), getVirtualHeight(), false);

  const canvas = renderer.domElement;
  canvas.style.cursor = ${JSON.stringify(cursor)};
  canvas.style.display = 'block';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.width = '100%';
  container.appendChild(canvas);`;
}

export function emitBlurMaterials() {
  return `
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
  });`;
}

type HalftoneUniformOverrides = {
  cropToBounds: number;
  hoverHalftoneRadius: string;
  hoverLightRadius: string;
  waveSpeed: string;
};

export function emitHalftoneMaterial(overrides: HalftoneUniformOverrides) {
  return `
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
      applyToDarkAreas: {
        value: settings.halftone.toneTarget === 'dark' ? 1 : 0,
      },
      dashColor: { value: new THREE.Color(settings.halftone.dashColor) },
      hoverDashColor: {
        value: new THREE.Color(settings.halftone.hoverDashColor),
      },
      time: { value: 0 },
      waveAmount: { value: 0 },
      waveSpeed: { value: ${overrides.waveSpeed} },
      footprintScale: { value: 1.0 },
      interactionUv: { value: new THREE.Vector2(0.5, 0.5) },
      interactionVelocity: { value: new THREE.Vector2(0, 0) },
      dragOffset: { value: new THREE.Vector2(0, 0) },
      hoverHalftoneActive: { value: 0 },
      hoverHalftonePowerShift: { value: 0 },
      hoverHalftoneRadius: { value: ${overrides.hoverHalftoneRadius} },
      hoverHalftoneWidthShift: { value: 0 },
      hoverLightStrength: { value: 0 },
      hoverLightRadius: { value: ${overrides.hoverLightRadius} },
      hoverFlowStrength: { value: 0 },
      hoverFlowRadius: { value: 0.18 },
      dragFlowStrength: { value: 0 },
      cropToBounds: { value: ${overrides.cropToBounds} },
    },
    vertexShader: passThroughVertexShader,
    fragmentShader: halftoneFragmentShader,
  });`;
}

export function emitPostScenes() {
  return `
  const blurHorizontalScene = new THREE.Scene();
  blurHorizontalScene.add(
    new THREE.Mesh(fullScreenGeometry, blurHorizontalMaterial),
  );

  const blurVerticalScene = new THREE.Scene();
  blurVerticalScene.add(new THREE.Mesh(fullScreenGeometry, blurVerticalMaterial));

  const postScene = new THREE.Scene();
  postScene.add(new THREE.Mesh(fullScreenGeometry, halftoneMaterial));`;
}

export function emitBlurPasses() {
  return `
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
    renderer.render(postScene, orthographicCamera);`;
}

export function emitTimerSetup() {
  return `
  const clock = new THREE.Timer();
  clock.connect(document);
  let animationFrameId = 0;`;
}

export function emitCleanup(extraDispose: string, extraListeners: string) {
  return `
  return () => {
    // boundary-allow-next-line:no-raw-animation-frame -- emitted into standalone HTML export
    window.cancelAnimationFrame(animationFrameId);
    clock.dispose();
    resizeObserver.disconnect();
${extraListeners}
    blurHorizontalMaterial.dispose();
    blurVerticalMaterial.dispose();
    halftoneMaterial.dispose();
    fullScreenGeometry.dispose();
${extraDispose}
    sceneTarget.dispose();
    blurTargetA.dispose();
    blurTargetB.dispose();
    renderer.dispose();

    if (canvas.parentNode === container) {
      container.removeChild(canvas);
    }
  };`;
}
