'use client';

import { styled } from '@linaria/react';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { TERMINAL_TOKENS } from './terminalTokens';

const TRAFFIC_LIGHT_DOT_SIZE = 12;
const TRAFFIC_LIGHT_GAP = 8;
const DEFAULT_HORIZONTAL_INSET = 6;

// Global event dispatched when the placeholder easter egg crosses its
// escalation threshold. Listened for by every TerminalTrafficLights on the
// page so all six dots (three per window) detach and fall at once.
export const TRAFFIC_LIGHTS_ESCAPE_EVENT = 'twenty-traffic-lights-escape';

// Physics tuned for a slow, floaty fall at ~60fps. Values are pixels per
// frame (or per frame^2 for gravity). Ground friction is intentionally low
// so the dots slide a little before settling, which reads as weight.
const GRAVITY = 0.55;
const BOUNCE_DAMPING = 0.4;
const AIR_FRICTION = 0.915;
const GROUND_FRICTION = 0.32;
const REST_VELOCITY = 0.9;
const FLOOR_PADDING = 0;
const INITIAL_POP_MIN = -5;
const INITIAL_POP_MAX = -8;
const INITIAL_HORIZONTAL_RANGE = 3;
const INITIAL_SPIN = 4;
const SCROLL_IMPULSE_MIN = 7;
const SCROLL_IMPULSE_MAX = 12;
const SCROLL_HORIZONTAL_RANGE = 1.5;

type PhysicsState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
  isResting: boolean;
};

const TrafficLightsContainer = styled.div<{ $horizontalInset: number }>`
  align-items: center;
  display: flex;
  gap: ${TRAFFIC_LIGHT_GAP}px;
  padding: 0 ${({ $horizontalInset }) => `${$horizontalInset}px`};
`;

const TrafficLightDot = styled.button<{
  $background: string;
  $backgroundActive: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: flex;
  flex: 0 0 auto;
  height: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  justify-content: center;
  padding: 0;
  position: relative;
  transition:
    background-color 0.12s ease,
    transform 0.12s ease;
  width: ${TRAFFIC_LIGHT_DOT_SIZE}px;

  &::after {
    border-radius: 999px;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.12);
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

  &:active {
    transform: scale(0.92);
  }

  /* While escaping, the originals stay in layout but are invisible — the
     visible bouncing dots are portaled copies on document.body so they're
     positioned relative to the viewport (not any transformed ancestor). */
  &[data-escaping='true'] {
    pointer-events: none;
    visibility: hidden;
  }
`;

// The portal layer renders each flying dot as position: fixed on document.body
// so the physics loop's coordinates match the viewport. The dots can fall past
// any overflow: hidden or transformed ancestor because they aren't descendants
// of those anymore. The container carries the physics transform; the inner
// ball carries the click-to-return pop animation so scale doesn't fight the
// physics translate/rotate.
const FlyingDotContainer = styled.button`
  background: transparent;
  border: none;
  cursor: default;
  display: block;
  height: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  left: 0;
  padding: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  width: ${TRAFFIC_LIGHT_DOT_SIZE}px;
  z-index: 9999;

  /* Catchable once the physics loop flags the dot as resting. */
  &[data-resting='true'] {
    cursor: pointer;
    pointer-events: auto;
  }
`;

const FlyingDotBall = styled.span<{
  $background: string;
  $backgroundActive: string;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: 999px;
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.12);
  display: flex;
  height: 100%;
  justify-content: center;
  transform-origin: center;
  transition: background-color 0.12s ease;
  width: 100%;

  svg {
    opacity: 0;
    transition: opacity 0.12s ease;
  }

  /* Mirror the resting dot's hover treatment from the top bar so it feels
     like the real Mac traffic lights even after they've fallen. */
  [data-resting='true']:hover > & {
    background: ${({ $backgroundActive }) => $backgroundActive};
  }

  [data-resting='true']:hover > & svg {
    opacity: 1;
  }

  &[data-returning='true'] {
    animation: dotPop 0.38s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  @keyframes dotPop {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    40% {
      opacity: 1;
      transform: scale(1.55);
    }
    100% {
      opacity: 0;
      transform: scale(0);
    }
  }
`;

const CloseGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 1 L5 5 M5 1 L1 5"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const MinimizeGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1 3 L5 3"
      stroke={TERMINAL_TOKENS.trafficLight.glyph}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

const ZoomGlyph = () => (
  <svg aria-hidden width="6" height="6" viewBox="0 0 6 6">
    <path
      d="M1.5 1.5 L1.5 4.5 L4.5 4.5 Z M4.5 1.5 L1.5 4.5"
      fill={TERMINAL_TOKENS.trafficLight.glyph}
    />
  </svg>
);

type TerminalTrafficLightsProps = {
  horizontalInset?: number;
  onZoomTripleClick?: () => void;
};

const DOT_DEFINITIONS = [
  {
    background: TERMINAL_TOKENS.trafficLight.close,
    backgroundActive: TERMINAL_TOKENS.trafficLight.closeActive,
    Glyph: CloseGlyph,
  },
  {
    background: TERMINAL_TOKENS.trafficLight.minimize,
    backgroundActive: TERMINAL_TOKENS.trafficLight.minimizeActive,
    Glyph: MinimizeGlyph,
  },
  {
    background: TERMINAL_TOKENS.trafficLight.zoom,
    backgroundActive: TERMINAL_TOKENS.trafficLight.zoomActive,
    Glyph: ZoomGlyph,
  },
];

export const TerminalTrafficLights = ({
  horizontalInset = DEFAULT_HORIZONTAL_INSET,
  onZoomTripleClick,
}: TerminalTrafficLightsProps) => {
  const [isEscaping, setIsEscaping] = useState(false);
  const [returningDots, setReturningDots] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [returnedDots, setReturnedDots] = useState<boolean[]>([
    false,
    false,
    false,
  ]);
  const [portalReady, setPortalReady] = useState(false);
  const originalRefs = useRef<Array<HTMLButtonElement | null>>([
    null,
    null,
    null,
  ]);
  const flyingRefs = useRef<Array<HTMLButtonElement | null>>([
    null,
    null,
    null,
  ]);
  const physicsRef = useRef<PhysicsState[]>([]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const handleZoomClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail === 3) {
      onZoomTripleClick?.();
    }
  };

  useEffect(() => {
    const handleEscape = () => {
      // Always reset and re-fling so each new streak of placeholder clicks
      // triggers a fresh escape, even if dots are mid-air or already resting.
      physicsRef.current = originalRefs.current.map((el) => {
        const rect = el?.getBoundingClientRect();
        return {
          x: rect?.left ?? 0,
          y: rect?.top ?? 0,
          vx: (Math.random() - 0.5) * 2 * INITIAL_HORIZONTAL_RANGE,
          vy:
            INITIAL_POP_MIN +
            Math.random() * (INITIAL_POP_MAX - INITIAL_POP_MIN),
          rotation: 0,
          angularVelocity: (Math.random() - 0.5) * 2 * INITIAL_SPIN,
          isResting: false,
        };
      });
      // Clear any data-resting markers from the previous run so returned dots
      // can be re-thrown without their cursor: pointer lingering.
      flyingRefs.current.forEach((el) => {
        if (el) el.removeAttribute('data-resting');
      });
      setReturningDots([false, false, false]);
      setReturnedDots([false, false, false]);
      setIsEscaping(true);
    };
    window.addEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, handleEscape);
    return () => {
      window.removeEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, handleEscape);
    };
  }, [isEscaping]);

  const handleCatchDot = (index: number) => {
    setReturningDots((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handlePopAnimationEnd = (index: number) => {
    setReturnedDots((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  useEffect(() => {
    if (!isEscaping) return;
    let rafId = 0;

    const tick = () => {
      const floor = window.innerHeight - TRAFFIC_LIGHT_DOT_SIZE - FLOOR_PADDING;
      const rightWall = window.innerWidth - TRAFFIC_LIGHT_DOT_SIZE;
      physicsRef.current.forEach((p, i) => {
        const el = flyingRefs.current[i];
        if (!el) return;
        if (p.isResting) {
          return;
        }

        p.vy += GRAVITY;
        p.vx *= AIR_FRICTION;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.angularVelocity;

        if (p.y >= floor) {
          p.y = floor;
          p.vx *= GROUND_FRICTION;
          if (Math.abs(p.vy) < REST_VELOCITY) {
            p.vy = 0;
            p.angularVelocity = 0;
            if (Math.abs(p.vx) < 0.3) {
              p.vx = 0;
              if (!p.isResting) {
                p.isResting = true;
                el.setAttribute('data-resting', 'true');
              }
            }
          } else {
            p.vy = -p.vy * BOUNCE_DAMPING;
            p.angularVelocity *= 0.7;
          }
        }

        if (p.x < 0) {
          p.x = 0;
          p.vx = -p.vx * BOUNCE_DAMPING;
        } else if (p.x > rightWall) {
          p.x = rightWall;
          p.vx = -p.vx * BOUNCE_DAMPING;
        }

        el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg)`;
      });
      const allSettled = physicsRef.current.every(
        (p, i) => p.isResting || !flyingRefs.current[i],
      );
      if (allSettled) {
        // Every dot has either come to rest or been caught/returned — suspend
        // the rAF loop. A scroll impulse or a fresh escape re-flings dots and
        // the tick is restarted from that effect.
        rafId = 0;
        return;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const handleScroll = () => {
      let anyDisturbed = false;
      physicsRef.current.forEach((p, i) => {
        if (!flyingRefs.current[i]) return;
        p.isResting = false;
        flyingRefs.current[i]?.removeAttribute('data-resting');
        p.vy = -(
          SCROLL_IMPULSE_MIN +
          Math.random() * (SCROLL_IMPULSE_MAX - SCROLL_IMPULSE_MIN)
        );
        p.vx += (Math.random() - 0.5) * 2 * SCROLL_HORIZONTAL_RANGE;
        p.angularVelocity += (Math.random() - 0.5) * 8;
        anyDisturbed = true;
      });
      if (anyDisturbed && rafId === 0) {
        rafId = requestAnimationFrame(tick);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isEscaping]);

  const setOriginalRef = (index: number) => (el: HTMLButtonElement | null) => {
    originalRefs.current[index] = el;
  };

  const setFlyingRef = (index: number) => (el: HTMLButtonElement | null) => {
    flyingRefs.current[index] = el;
    if (el) {
      // Seed with the captured starting position so the first paint before
      // rAF runs doesn't flash the dot in the top-left corner.
      const p = physicsRef.current[index];
      if (p) {
        el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      }
    }
  };

  return (
    <TrafficLightsContainer
      $horizontalInset={horizontalInset}
      aria-label="Window controls"
    >
      <TrafficLightDot
        aria-label="Close"
        $background={TERMINAL_TOKENS.trafficLight.close}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.closeActive}
        data-escaping={isEscaping && !returnedDots[0] ? 'true' : 'false'}
        ref={setOriginalRef(0)}
        type="button"
      >
        <CloseGlyph />
      </TrafficLightDot>
      <TrafficLightDot
        aria-label="Minimize"
        $background={TERMINAL_TOKENS.trafficLight.minimize}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.minimizeActive}
        data-escaping={isEscaping && !returnedDots[1] ? 'true' : 'false'}
        ref={setOriginalRef(1)}
        type="button"
      >
        <MinimizeGlyph />
      </TrafficLightDot>
      <TrafficLightDot
        aria-label="Zoom"
        $background={TERMINAL_TOKENS.trafficLight.zoom}
        $backgroundActive={TERMINAL_TOKENS.trafficLight.zoomActive}
        data-escaping={isEscaping && !returnedDots[2] ? 'true' : 'false'}
        onClick={handleZoomClick}
        ref={setOriginalRef(2)}
        type="button"
      >
        <ZoomGlyph />
      </TrafficLightDot>

      {isEscaping && portalReady
        ? createPortal(
            <>
              {DOT_DEFINITIONS.map(
                ({ background, backgroundActive, Glyph }, index) =>
                  returnedDots[index] ? null : (
                    <FlyingDotContainer
                      key={index}
                      aria-label="Return traffic light"
                      onClick={() => handleCatchDot(index)}
                      ref={setFlyingRef(index)}
                      type="button"
                    >
                      <FlyingDotBall
                        $background={background}
                        $backgroundActive={backgroundActive}
                        data-returning={returningDots[index] ? 'true' : 'false'}
                        onAnimationEnd={() => handlePopAnimationEnd(index)}
                      >
                        <Glyph />
                      </FlyingDotBall>
                    </FlyingDotContainer>
                  ),
              )}
            </>,
            document.body,
          )
        : null}
    </TrafficLightsContainer>
  );
};
