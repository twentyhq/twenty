import {
  normalizeHalftoneStudioSettings,
  type HalftoneImageFit,
  type HalftoneImageInteractionSettings,
  type HalftoneStudioSettings,
} from '@/lib/halftone';

export const CUSTOMER_CASES_COVER_DEFAULT_DASH_COLOR = '#4A38F5';
export const CUSTOMER_CASES_COVER_DEFAULT_HOVER_DASH_COLOR = '#8B7FF8';
export const CUSTOMER_CASES_COVER_IMAGE_FIT: HalftoneImageFit = 'cover';
export const CUSTOMER_CASES_COVER_PREVIEW_DISTANCE = 4;
export const CUSTOMER_CASES_COVER_VIRTUAL_RENDER_HEIGHT = 512;

export const CUSTOMER_CASES_COVER_IMAGE_INTERACTION = {
  hoverFadeIn: 10,
  hoverFadeOut: 5,
  pointerFollow: 0.3,
} satisfies Partial<HalftoneImageInteractionSettings>;

const CSS_VAR_PATTERN = /^var\(\s*(--[^,)]+)(?:\s*,\s*([^)]+))?\s*\)$/;

export function resolveColorValue(value: string, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const match = value.trim().match(CSS_VAR_PATTERN);

  if (!match) {
    return value;
  }

  if (typeof window === 'undefined') {
    return match[2]?.trim() ?? fallback;
  }

  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();

  return resolved || match[2]?.trim() || fallback;
}

export const buildCustomerCasesCoverSettings = ({
  dashColor,
  hoverDashColor,
}: {
  dashColor: string;
  hoverDashColor: string;
}): HalftoneStudioSettings =>
  normalizeHalftoneStudioSettings({
    sourceMode: 'image',
    shapeKey: 'torusKnot',
    lighting: {
      intensity: 1.5,
      fillIntensity: 0.15,
      ambientIntensity: 0.08,
      angleDegrees: 45,
      height: 2,
    },
    material: {
      surface: 'solid',
      color: '#d4d0c8',
      roughness: 0.42,
      metalness: 0.16,
      thickness: 150,
      refraction: 2,
      environmentPower: 5,
    },
    halftone: {
      enabled: true,
      scale: 24.72,
      power: -0.07,
      toneTarget: 'light',
      width: 0.46,
      imageContrast: 1,
      dashColor,
      hoverDashColor,
    },
    background: {
      transparent: true,
      color: '#000000',
    },
    animation: {
      autoRotateEnabled: true,
      breatheEnabled: false,
      cameraParallaxEnabled: false,
      followHoverEnabled: false,
      followDragEnabled: false,
      floatEnabled: false,
      hoverHalftoneEnabled: true,
      hoverLightEnabled: false,
      dragFlowEnabled: false,
      lightSweepEnabled: false,
      rotateEnabled: false,
      autoSpeed: 0.2,
      autoWobble: 0.3,
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
      rotateSpeed: 0.2,
      rotatePingPong: false,
      floatAmplitude: 0.16,
      floatSpeed: 0.8,
      lightSweepHeightRange: 0.5,
      lightSweepRange: 28,
      lightSweepSpeed: 0.7,
      springDamping: 0.72,
      springReturnEnabled: false,
      springStrength: 0.18,
      hoverHalftonePowerShift: 0.45,
      hoverHalftoneRadius: 0.6,
      hoverHalftoneWidthShift: -0.1,
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
  });
