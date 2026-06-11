import { styled } from '@linaria/react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_THEME } from '@/tokens/app-preview/app-preview-theme';

import { TrafficLights } from './traffic-lights';

const stage = APP_PREVIEW_STAGE.windowBar;

const BarRoot = styled.div`
  align-items: center;
  background: ${stage.background};
  border-bottom: 1px solid ${stage.border};
  box-shadow: inset 0 1px 0 ${stage.highlight};
  cursor: default;
  display: grid;
  flex-shrink: 0;
  grid-template-columns: auto 1fr auto;
  padding: ${stage.verticalPaddingPx}px ${stage.horizontalPaddingPx}px;
  user-select: none;
  width: 100%;
`;

const Title = styled.span`
  color: ${stage.titleColor};
  font-family: ${APP_PREVIEW_THEME.font.family};
  font-size: 12px;
  font-weight: ${APP_PREVIEW_THEME.font.weight.medium};
  justify-self: center;
  letter-spacing: 0.1px;
  text-align: center;
`;

const RightSpacer = styled.div`
  width: ${stage.trafficLightSlotWidthPx}px;
`;

export function WindowBar({ title = 'Twenty' }: { title?: string }) {
  return (
    <BarRoot>
      <TrafficLights />
      <Title>{title}</Title>
      {/* Mirrors the controls width so the centered title does not drift. */}
      <RightSpacer aria-hidden />
    </BarRoot>
  );
}
