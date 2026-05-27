'use client';

import { useRef, type CSSProperties } from 'react';
import { DEFAULT_TUNING } from './monolith-halftone-mount';
import { useMonolithHalftone } from './use-monolith-halftone';

const IMAGE_SRC = '/images/home/problem/monolith-problem.webp';

type MonolithProps = {
  imageUrl?: string;
  style?: CSSProperties;
};

export default function Monolith({
  imageUrl = IMAGE_SRC,
  style,
}: MonolithProps) {
  const mountReference = useRef<HTMLDivElement>(null);

  useMonolithHalftone({ imageUrl, mountRef: mountReference });

  return (
    <div
      ref={mountReference}
      style={{
        background: DEFAULT_TUNING.backgroundColor,
        height: '100%',
        width: '100%',
        ...style,
      }}
    />
  );
}
