import { styled } from '@linaria/react';
import type React from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { TrafficLights } from './TrafficLights';

const stage = APP_PREVIEW_STAGE.windowBar;

const BarRoot = styled.div<{ $grabbable?: boolean; $isDragging?: boolean }>`
  align-items: center;
  background: ${stage.background};
  border-bottom: 1px solid ${stage.border};
  box-shadow: inset 0 1px 0 ${stage.highlight};
  cursor: ${({ $grabbable, $isDragging }) =>
    $grabbable ? ($isDragging ? 'grabbing' : 'grab') : 'default'};
  display: grid;
  flex-shrink: 0;
  grid-template-columns: auto 1fr auto;
  padding: ${stage.verticalPaddingPx}px ${stage.horizontalPaddingPx}px;
  user-select: none;
  width: 100%;
`;

const Title = styled.span`
  color: ${stage.titleColor};
  font-family: var(--font-product), sans-serif;
  font-size: 12px;
  font-weight: ${THEME_LIGHT.font.weight.medium};
  justify-self: center;
  letter-spacing: 0.1px;
  text-align: center;
`;

const RightSpacer = styled.div`
  width: ${stage.trafficLightSlotWidthPx}px;
`;

export function WindowBar({
  isDragging = false,
  onDragStart,
  title = 'Twenty',
}: {
  isDragging?: boolean;
  onDragStart?: (event: React.PointerEvent<HTMLDivElement>) => void;
  title?: string;
}) {
  return (
    <BarRoot
      $grabbable={onDragStart !== undefined}
      $isDragging={isDragging}
      onPointerDown={onDragStart}
    >
      <TrafficLights />
      <Title>{title}</Title>
      {/* Mirrors the controls width so the centered title does not drift. */}
      <RightSpacer aria-hidden />
    </BarRoot>
  );
}
