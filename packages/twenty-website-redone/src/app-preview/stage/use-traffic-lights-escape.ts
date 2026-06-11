'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefCallback,
} from 'react';

import { createAnimationFrameLoop } from '@/platform/motion';

import {
  trafficLightPhysics,
  type TrafficLightPhysicsState,
} from './traffic-light-physics';
import { TRAFFIC_LIGHTS_ESCAPE_EVENT } from './traffic-lights-escape-event';

const TRAFFIC_LIGHT_DOT_SIZE = 12;
const TRAFFIC_LIGHT_COUNT = 3;
const FLOOR_PADDING = 0;

const createReturnState = (): boolean[] =>
  Array.from({ length: TRAFFIC_LIGHT_COUNT }, () => false);

// The escape egg, ported as-is: the prompt egg's window event launches
// the dots out of the bar; they bounce to the page floor under gravity,
// get disturbed by scroll, and return when caught.
export const useTrafficLightsEscape = () => {
  const [isEscaping, setIsEscaping] = useState(false);
  const [returningDots, setReturningDots] = useState(createReturnState);
  const [returnedDots, setReturnedDots] = useState(createReturnState);
  const [portalReady, setPortalReady] = useState(false);
  const originalRefs = useRef<Array<HTMLElement | null>>([null, null, null]);
  const flyingRefs = useRef<Array<HTMLButtonElement | null>>([
    null,
    null,
    null,
  ]);
  const physicsRef = useRef<TrafficLightPhysicsState[]>([]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const escape = useCallback(() => {
    physicsRef.current = originalRefs.current.map((element) => {
      const rect = element?.getBoundingClientRect();

      return trafficLightPhysics.createState(rect);
    });

    flyingRefs.current.forEach((element) => {
      element?.removeAttribute('data-resting');
    });
    setReturningDots(createReturnState());
    setReturnedDots(createReturnState());
    setIsEscaping(true);
  }, []);

  useEffect(() => {
    window.addEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, escape);

    return () => {
      window.removeEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, escape);
    };
  }, [escape]);

  useEffect(() => {
    if (!isEscaping) {
      return;
    }

    const physicsLoop = createAnimationFrameLoop({
      onFrame: () => {
        const floor =
          window.innerHeight - TRAFFIC_LIGHT_DOT_SIZE - FLOOR_PADDING;
        const rightWall = window.innerWidth - TRAFFIC_LIGHT_DOT_SIZE;

        physicsRef.current.forEach((physicsState, index) => {
          const element = flyingRefs.current[index];

          if (!element) {
            return;
          }

          const wasResting = physicsState.isResting;
          trafficLightPhysics.step(physicsState, { floor, rightWall });

          if (!wasResting && physicsState.isResting) {
            element.setAttribute('data-resting', 'true');
          }

          element.style.transform = `translate(${physicsState.x}px, ${physicsState.y}px) rotate(${physicsState.rotation}deg)`;
        });

        return !physicsRef.current.every(
          (physicsState, index) =>
            physicsState.isResting || !flyingRefs.current[index],
        );
      },
    });

    physicsLoop.start();

    const handleScroll = () => {
      let anyDisturbed = false;

      physicsRef.current.forEach((physicsState, index) => {
        const element = flyingRefs.current[index];

        if (!element) {
          return;
        }

        trafficLightPhysics.disturb(physicsState);
        element.removeAttribute('data-resting');
        anyDisturbed = true;
      });

      if (anyDisturbed) {
        physicsLoop.start();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      physicsLoop.stop();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isEscaping]);

  const handleCatchDot = useCallback((index: number) => {
    setReturningDots((previous) => {
      if (previous[index]) {
        return previous;
      }

      const next = [...previous];
      next[index] = true;

      return next;
    });
  }, []);

  const handlePopAnimationEnd = useCallback((index: number) => {
    setReturnedDots((previous) => {
      if (previous[index]) {
        return previous;
      }

      const next = [...previous];
      next[index] = true;

      return next;
    });
  }, []);

  const setOriginalRef = useCallback(
    (index: number): RefCallback<HTMLElement> =>
      (element) => {
        originalRefs.current[index] = element;
      },
    [],
  );

  const setFlyingRef = useCallback(
    (index: number): RefCallback<HTMLButtonElement> =>
      (element) => {
        flyingRefs.current[index] = element;

        if (!element) {
          return;
        }

        const physicsState = physicsRef.current[index];

        if (physicsState) {
          element.style.transform = `translate(${physicsState.x}px, ${physicsState.y}px)`;
        }
      },
    [],
  );

  return {
    escape,
    handleCatchDot,
    handlePopAnimationEnd,
    isEscaping,
    portalReady,
    returnedDots,
    returningDots,
    setFlyingRef,
    setOriginalRef,
  };
};
