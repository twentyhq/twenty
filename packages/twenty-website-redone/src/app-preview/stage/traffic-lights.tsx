'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type MouseEvent as ReactMouseEvent } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

// The macOS window controls: colored dots whose glyphs reveal on hover.
// The zoom dot accepts a triple-click handler (the terminal's functional
// jump-to-end); the escape physics egg arrives with the editor commit.
const CloseGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 1 L5 5 M5 1 L1 5"
      stroke={APP_PREVIEW_STAGE.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 3 L5 3"
      stroke={APP_PREVIEW_STAGE.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ZoomGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1.5 1.5 L1.5 4.5 L4.5 4.5 Z M4.5 1.5 L1.5 4.5"
      fill={APP_PREVIEW_STAGE.trafficLight.glyph}
    />
  </svg>
);

const DOT_DEFINITIONS = [
  {
    background: APP_PREVIEW_STAGE.trafficLight.close,
    backgroundActive: APP_PREVIEW_STAGE.trafficLight.closeActive,
    Glyph: CloseGlyph,
    label: 'Close',
  },
  {
    background: APP_PREVIEW_STAGE.trafficLight.minimize,
    backgroundActive: APP_PREVIEW_STAGE.trafficLight.minimizeActive,
    Glyph: MinimizeGlyph,
    label: 'Minimize',
  },
  {
    background: APP_PREVIEW_STAGE.trafficLight.zoom,
    backgroundActive: APP_PREVIEW_STAGE.trafficLight.zoomActive,
    Glyph: ZoomGlyph,
    label: 'Zoom',
  },
];

const Container = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  padding: 0 6px;
`;

const Dot = styled.span<{ $background: string; $backgroundActive: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: none;
  border-radius: 999px;
  display: flex;
  flex: 0 0 auto;
  height: 12px;
  justify-content: center;
  padding: 0;
  position: relative;
  transition: background-color 0.12s ease;
  width: 12px;

  &::after {
    border-radius: 999px;
    box-shadow: inset 0 0 0 0.5px ${APP_PREVIEW_STAGE.trafficLight.ring};
    content: '';
    inset: 0;
    pointer-events: none;
    position: absolute;
  }

  svg {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  &:hover {
    background: ${({ $backgroundActive }) => $backgroundActive};

    svg {
      opacity: 1;
    }
  }
`;

export function TrafficLights({
  onZoomTripleClick,
}: {
  onZoomTripleClick?: () => void;
} = {}) {
  const { i18n } = useLingui();
  const isInteractive = onZoomTripleClick !== undefined;
  const handleZoomClick =
    onZoomTripleClick === undefined
      ? undefined
      : (event: ReactMouseEvent<HTMLElement>) => {
          if (event.detail === 3) {
            onZoomTripleClick();
          }
        };

  return (
    <Container
      aria-hidden={isInteractive ? undefined : true}
      aria-label={isInteractive ? i18n._(msg`Window controls`) : undefined}
    >
      {DOT_DEFINITIONS.map(({ background, backgroundActive, Glyph, label }) => {
        const isZoom = label === 'Zoom';

        return (
          <Dot
            $background={background}
            $backgroundActive={backgroundActive}
            aria-label={isZoom && isInteractive ? i18n._(msg`Zoom`) : undefined}
            as={isZoom && handleZoomClick !== undefined ? 'button' : 'span'}
            key={label}
            onClick={isZoom ? handleZoomClick : undefined}
          >
            <Glyph />
          </Dot>
        );
      })}
    </Container>
  );
}
