export function formatAngle(value: number) {
  return `${value}°`;
}

export function formatDecimal(value: number, digits = 2) {
  return value.toFixed(digits);
}

export function formatPercent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatAnimationName(
  animation: {
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
  },
  sourceMode: 'shape' | 'image',
) {
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
