'use client';

import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { TwentyLogo } from '@/icons';
import {
  color,
  DURATION,
  EASING,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
} from '@/tokens';

import { type MarketplaceApp } from './marketplace-app';
import { useAppsStageLogoInks } from './use-apps-stage-logo-inks';

// PROTOTYPE (?direction=e): the app page's scene, after Profound's
// integration pages. Twenty's tile and the app's tile, joined by a line a
// point keeps travelling along: data going both ways.
const Stage = styled.div`
  --apps-stage-tile: 88px;
  --apps-stage-gap: 96px;
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 280px;
  overflow: hidden;
  position: relative;

  ${mediaUp('md')} {
    --apps-stage-tile: 120px;
    --apps-stage-gap: 200px;
    min-height: 380px;
  }
`;

// Twenty's dots, tone on tone, fading out from the middle.
const Floor = styled.div`
  background-image: radial-gradient(
    circle,
    ${color('white-10')} 1.2px,
    transparent 1.6px
  );
  background-size: 14px 14px;
  inset: 0;
  mask-image: radial-gradient(
    ellipse 55% 60% at 50% 50%,
    ${color('black')} 20%,
    transparent 80%
  );
  position: absolute;
`;

const Row = styled.div`
  align-items: center;
  display: flex;
  gap: var(--apps-stage-gap);
  position: relative;
`;

const Tile = styled.div`
  align-items: center;
  animation: apps-stage-app-tile-in ${DURATION.xl} ${EASING.standard} both;
  background-color: ${color('charcoal')};
  border-radius: ${radius(3)};
  box-shadow: inset 0 0 0 1px ${semanticColor.line};
  clip-path: polygon(0 0, 100% 0, 100% 82%, 82% 100%, 0 100%);
  display: flex;
  flex-shrink: 0;
  height: var(--apps-stage-tile);
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: var(--apps-stage-tile);
  z-index: 1;

  &[data-side='app'] {
    --apps-stage-from: 24px;
    animation-delay: 80ms;
  }

  &[data-side='twenty'] {
    --apps-stage-from: -24px;
  }

  &[data-kind='glyph'] {
    background-color: ${color('neutral')};
  }

  @keyframes apps-stage-app-tile-in {
    from {
      opacity: 0;
      transform: translateX(var(--apps-stage-from));
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const TwentyMark = styled.div`
  height: 56%;
  width: 56%;

  & > svg {
    height: 100%;
    width: 100%;
  }
`;

const Logo = styled.img`
  height: 56%;
  object-fit: contain;
  width: 56%;

  [data-kind='plate'] > & {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  [data-kind='unknown'] > & {
    opacity: 0;
  }
`;

// The line draws once both tiles are in, then the point starts travelling.
const Connector = styled.div`
  animation: apps-stage-app-line-in ${DURATION.xl} ${EASING.standard} 420ms both;
  border-top: 1px dashed ${color('white-20')};
  left: var(--apps-stage-tile);
  position: absolute;
  right: var(--apps-stage-tile);
  top: 50%;
  transform-origin: 0 50%;

  @keyframes apps-stage-app-line-in {
    from {
      transform: scaleX(0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Pulse = styled.span`
  animation: apps-stage-app-pulse 2.4s ${EASING.smooth} 1.1s infinite alternate
    both;
  background-color: var(--apps-stage-pastel);
  border-radius: ${radius(0.5)};
  height: 7px;
  left: 0;
  position: absolute;
  top: -4px;
  width: 7px;

  @keyframes apps-stage-app-pulse {
    from {
      left: 0;
      opacity: 0;
    }

    12% {
      opacity: 1;
    }

    88% {
      opacity: 1;
    }

    to {
      left: calc(100% - 7px);
      opacity: 0;
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
    left: calc(50% - 3.5px);
  }
`;

type StageStyle = CSSProperties & { '--apps-stage-pastel': string };

type AppsStageAppStageProps = {
  app: MarketplaceApp;
  pastel: string;
};

export function AppsStageAppStage({ app, pastel }: AppsStageAppStageProps) {
  const inks = useAppsStageLogoInks([app]);
  const kind = inks[app.slug]?.kind ?? 'unknown';
  const style: StageStyle = { '--apps-stage-pastel': pastel };

  return (
    <Stage aria-hidden style={style}>
      <Floor />
      <Row>
        <Tile data-side="twenty">
          <TwentyMark>
            <TwentyLogo sizePx={40} />
          </TwentyMark>
        </Tile>
        <Connector>
          <Pulse />
        </Connector>
        <Tile data-kind={kind} data-side="app">
          {app.logoUrl !== undefined && <Logo alt="" src={app.logoUrl} />}
        </Tile>
      </Row>
    </Stage>
  );
}
