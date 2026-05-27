'use client';

import { styled } from '@linaria/react';
import { useRef } from 'react';
import type * as THREE from 'three';
import {
  useHourglassCanvas,
  type HourglassPose,
  type HourglassSettings,
} from '../hooks/use-hourglass-canvas';

const CanvasMount = styled.div<{ $background: string }>`
  background: ${(props) => props.$background};
  display: block;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

type HourglassCanvasProps = {
  geometry: THREE.BufferGeometry;
  initialPose?: Partial<HourglassPose>;
  previewDistance: number;
  settings: HourglassSettings;
};

export function HourglassCanvas({
  geometry,
  initialPose,
  previewDistance,
  settings,
}: HourglassCanvasProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useHourglassCanvas({
    geometry,
    initialPose,
    mountRef: mountReference,
    previewDistance,
    settings,
  });

  return (
    <CanvasMount $background={settings.background.color} ref={mountReference} />
  );
}
