'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useRef, type MouseEvent as ReactMouseEvent } from 'react';

import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';

import { FlyingTrafficLights } from './flying-traffic-lights';
import { TRAFFIC_LIGHT_DOT_DEFINITIONS } from './traffic-light-definitions';
import { useTrafficLightsEscape } from './use-traffic-lights-escape';

// The macOS window controls. Two deliberate behaviors when interactive:
// zoom triple-click is the functional jump-to-end, and the close dot's
// THIRD click launches the escape egg — you tried to close the demo
// twice already; the window objects.
const CLOSE_ESCAPE_CLICK_THRESHOLD = 3;

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

  &[data-escaping='true'] {
    pointer-events: none;
    visibility: hidden;
  }
`;

export function TrafficLights({
  onZoomTripleClick,
  escapeEnabled = false,
}: {
  onZoomTripleClick?: () => void;
  escapeEnabled?: boolean;
} = {}) {
  const { i18n } = useLingui();
  const closeClickCountRef = useRef(0);
  const {
    escape,
    handleCatchDot,
    handlePopAnimationEnd,
    isEscaping,
    portalReady,
    returnedDots,
    returningDots,
    setFlyingRef,
    setOriginalRef,
  } = useTrafficLightsEscape();
  const isInteractive = onZoomTripleClick !== undefined || escapeEnabled;

  const handleZoomClick =
    onZoomTripleClick === undefined
      ? undefined
      : (event: ReactMouseEvent<HTMLElement>) => {
          if (event.detail === 3) {
            onZoomTripleClick();
          }
        };

  const handleCloseClick = !escapeEnabled
    ? undefined
    : () => {
        closeClickCountRef.current += 1;
        if (closeClickCountRef.current >= CLOSE_ESCAPE_CLICK_THRESHOLD) {
          closeClickCountRef.current = 0;
          escape();
        }
      };

  const dotAriaLabel = (label: string): string | undefined => {
    if (!isInteractive) {
      return undefined;
    }
    if (label === 'Zoom') {
      return i18n._(msg`Zoom`);
    }
    if (label === 'Close') {
      return i18n._(msg`Close`);
    }
    return undefined;
  };

  return (
    <Container
      aria-hidden={isInteractive ? undefined : true}
      aria-label={isInteractive ? i18n._(msg`Window controls`) : undefined}
    >
      {TRAFFIC_LIGHT_DOT_DEFINITIONS.map(
        ({ background, backgroundActive, Glyph, label }, index) => {
          const clickHandlers: Record<
            string,
            ((event: ReactMouseEvent<HTMLElement>) => void) | undefined
          > = {
            Zoom: handleZoomClick,
            Close: handleCloseClick,
          };
          const onClick = clickHandlers[label];

          return (
            <Dot
              $background={background}
              $backgroundActive={backgroundActive}
              aria-label={dotAriaLabel(label)}
              as={onClick === undefined ? 'span' : 'button'}
              data-escaping={
                isEscaping && !returnedDots[index] ? 'true' : 'false'
              }
              key={label}
              onClick={onClick}
              ref={escapeEnabled ? setOriginalRef(index) : undefined}
            >
              <Glyph />
            </Dot>
          );
        },
      )}
      {escapeEnabled ? (
        <FlyingTrafficLights
          onCatchDot={handleCatchDot}
          onPopAnimationEnd={handlePopAnimationEnd}
          portalReady={portalReady}
          returningDots={returningDots}
          returnedDots={returnedDots}
          setFlyingRef={setFlyingRef}
          visible={isEscaping}
        />
      ) : null}
    </Container>
  );
}
