import { useEffect, useRef, useState, type RefCallback } from 'react';
import { createAnimationFrameLoop } from '@/lib/animation';
import {
  createTrafficLightPhysicsState,
  disturbTrafficLightPhysicsState,
  stepTrafficLightPhysicsState,
  type TrafficLightPhysicsState,
} from '../utils/terminal-traffic-light-physics';
import {
  createTrafficLightReturnState,
  TRAFFIC_LIGHT_DOT_SIZE,
  TRAFFIC_LIGHTS_ESCAPE_EVENT,
} from '../utils/terminal-traffic-light-constants';

const FLOOR_PADDING = 0;

export const useTerminalTrafficLightsEscape = () => {
  const [isEscaping, setIsEscaping] = useState(false);
  const [returningDots, setReturningDots] = useState(
    createTrafficLightReturnState,
  );
  const [returnedDots, setReturnedDots] = useState(
    createTrafficLightReturnState,
  );
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
  const physicsRef = useRef<TrafficLightPhysicsState[]>([]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const handleEscape = () => {
      physicsRef.current = originalRefs.current.map((element) => {
        const rect = element?.getBoundingClientRect();

        return createTrafficLightPhysicsState(rect);
      });

      flyingRefs.current.forEach((element) => {
        element?.removeAttribute('data-resting');
      });
      setReturningDots(createTrafficLightReturnState());
      setReturnedDots(createTrafficLightReturnState());
      setIsEscaping(true);
    };

    window.addEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, handleEscape);

    return () => {
      window.removeEventListener(TRAFFIC_LIGHTS_ESCAPE_EVENT, handleEscape);
    };
  }, []);

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
          stepTrafficLightPhysicsState(physicsState, { floor, rightWall });

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

        disturbTrafficLightPhysicsState(physicsState);
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

  const handleCatchDot = (index: number) => {
    setReturningDots((previous) => {
      if (previous[index]) {
        return previous;
      }

      const next = [...previous];
      next[index] = true;

      return next;
    });
  };

  const handlePopAnimationEnd = (index: number) => {
    setReturnedDots((previous) => {
      if (previous[index]) {
        return previous;
      }

      const next = [...previous];
      next[index] = true;

      return next;
    });
  };

  const setOriginalRef =
    (index: number): RefCallback<HTMLButtonElement> =>
    (element) => {
      originalRefs.current[index] = element;
    };

  const setFlyingRef =
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
    };

  return {
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
