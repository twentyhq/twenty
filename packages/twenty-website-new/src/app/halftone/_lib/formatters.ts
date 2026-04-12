export function formatAngle(value: number) {
  return `${value}°`;
}

export function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatPercent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatAnimationName(animation: {
  autoRotateEnabled: boolean;
  breatheEnabled: boolean;
  cameraParallaxEnabled: boolean;
  dragFlowEnabled: boolean;
  followHoverEnabled: boolean;
  followDragEnabled: boolean;
  floatEnabled: boolean;
  hoverHalftoneEnabled: boolean;
  hoverLightEnabled: boolean;
  lightSweepEnabled: boolean;
  rotateEnabled: boolean;
  rotatePreset: string;
  springReturnEnabled: boolean;
}, sourceMode: 'shape' | 'image') {
  const activeModes: string[] = [];

  if (sourceMode === 'image') {
    if (animation.hoverHalftoneEnabled) {
      activeModes.push('hoverHalftone');
    }

    if (animation.hoverLightEnabled) {
      activeModes.push('hoverLight');
    }

    return activeModes.length > 0 ? activeModes.join(' + ') : 'still';
  }

  if (animation.autoRotateEnabled) {
    activeModes.push('autoRotate');
  }

  if (animation.floatEnabled) {
    activeModes.push('float');
  }

  if (animation.breatheEnabled) {
    activeModes.push('breathe');
  }

  if (animation.followHoverEnabled) {
    activeModes.push('followHover');
  }

  if (animation.followDragEnabled) {
    activeModes.push('followDrag');
  }

  if (animation.rotateEnabled) {
    activeModes.push(
      animation.rotatePreset === 'axis'
        ? 'rotate'
        : `rotate(${animation.rotatePreset})`,
    );
  }

  if (animation.lightSweepEnabled) {
    activeModes.push('lightSweep');
  }

  if (animation.cameraParallaxEnabled) {
    activeModes.push('cameraParallax');
  }

  if (animation.springReturnEnabled) {
    activeModes.push('spring');
  }

  return activeModes.length > 0 ? activeModes.join(' + ') : 'still';
}

export function getBackgroundTone(background: {
  color: string;
  transparent: boolean;
}) {
  if (background.transparent) {
    return 'light';
  }

  const normalized = background.color.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : normalized;

  const value = Number.parseInt(expanded, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance < 0.5 ? 'dark' : 'light';
}
