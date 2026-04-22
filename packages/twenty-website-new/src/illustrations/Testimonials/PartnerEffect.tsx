'use client';

import { HalftoneCanvas } from '@/app/halftone/_components/HalftoneCanvas';
import type { HalftoneStudioSettings } from '@/app/halftone/_lib/state';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const PARTNER_EFFECT_PREVIEW_DISTANCE = 4;

const PARTNER_EFFECT_SETTINGS: HalftoneStudioSettings = {
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
    scale: 8,
    power: -0.07,
    toneTarget: 'light',
    width: 0.46,
    imageContrast: 1,
    dashColor: '#FFFFFF',
    hoverDashColor: '#FFFFFF',
  },
  background: {
    transparent: true,
    color: 'transparent',
  },
  animation: {
    autoRotateEnabled: true,
    breatheEnabled: false,
    cameraParallaxEnabled: false,
    followHoverEnabled: false,
    followDragEnabled: false,
    floatEnabled: false,
    hoverHalftoneEnabled: true,
    hoverLightEnabled: true,
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
    hoverRange: 64,
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
    hoverHalftonePowerShift: 0.42,
    hoverHalftoneRadius: 0.9,
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

const noopFirstInteraction = () => {};
const noopPoseChange = () => {};

const EffectFrame = styled.div`
  height: 100%;
  position: relative;
  width: 100%;

  & canvas {
    cursor: default !important;
  }
`;

const EffectPlaceholder = styled.div`
  align-items: center;
  background-color: ${theme.colors.secondary.border[10]};
  color: ${theme.colors.secondary.text[60]};
  display: flex;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(12)};
  font-weight: ${theme.font.weight.medium};
  height: 100%;
  justify-content: center;
  letter-spacing: -0.02em;
  width: 100%;
`;

type PartnerEffectProps = {
  alt: string;
  fallback: string;
  src: string;
};

export function PartnerEffect({ alt, fallback, src }: PartnerEffectProps) {
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );
  const geometryReference = useRef<THREE.PlaneGeometry | null>(null);

  if (geometryReference.current === null) {
    geometryReference.current = new THREE.PlaneGeometry(1, 1);
  }

  useEffect(() => {
    const geometry = geometryReference.current;

    return () => {
      geometry?.dispose();
      geometryReference.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    setImageElement(null);

    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (cancelled) {
        return;
      }

      setImageElement(image);
    };
    image.onerror = () => {
      if (cancelled) {
        return;
      }

      console.error(`Failed to load testimonial portrait: ${src}`);
    };
    image.src = src;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      image.src = '';
    };
  }, [src]);

  return (
    <EffectFrame aria-label={alt} role="img">
      {imageElement && geometryReference.current ? (
        <HalftoneCanvas
          geometry={geometryReference.current}
          imageElement={imageElement}
          onFirstInteraction={noopFirstInteraction}
          onPoseChange={noopPoseChange}
          previewDistance={PARTNER_EFFECT_PREVIEW_DISTANCE}
          settings={PARTNER_EFFECT_SETTINGS}
        />
      ) : (
        <EffectPlaceholder aria-hidden={Boolean(alt)}>
          {fallback}
        </EffectPlaceholder>
      )}
    </EffectFrame>
  );
}
