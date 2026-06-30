'use client';

import { styled } from '@linaria/react';
import { useRef, type ReactNode } from 'react';

import { useScaleToFit } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const shell = PRODUCT_STEPPER_SCENE.shell;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${shell.font};
  height: 100%;
  opacity: 0.7;
  overflow: hidden;
  transition: opacity 0.3s;
  width: 100%;

  &[data-active] {
    opacity: 1;
  }
`;

const Canvas = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
  user-select: none;
`;

const StageFitContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StageBox = styled.div`
  flex-shrink: 0;
  position: relative;
`;

const SvgLayer = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

function Shell({ active, children }: { active: boolean; children: ReactNode }) {
  return <Wrapper data-active={active ? '' : undefined}>{children}</Wrapper>;
}

function StageFit({
  baseScale = 1,
  children,
  designHeight,
  designWidth,
  zoom = 1,
}: {
  baseScale?: number;
  children: ReactNode;
  designHeight: number;
  designWidth: number;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fit = useScaleToFit(containerRef, designWidth, designHeight, 1);
  const scale = Math.min(baseScale, zoom * fit || baseScale);

  return (
    <StageFitContainer ref={containerRef}>
      <StageBox
        style={{
          height: designHeight,
          transform: `scale(${scale})`,
          width: designWidth,
        }}
      >
        {children}
      </StageBox>
    </StageFitContainer>
  );
}

export const STEPPER_SHELL_CHROME = {
  Canvas,
  Shell,
  StageFit,
  SvgLayer,
};
