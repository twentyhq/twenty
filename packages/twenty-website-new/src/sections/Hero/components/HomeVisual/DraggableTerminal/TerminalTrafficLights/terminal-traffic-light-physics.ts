const GRAVITY = 0.55;
const BOUNCE_DAMPING = 0.4;
const AIR_FRICTION = 0.915;
const GROUND_FRICTION = 0.32;
const REST_VELOCITY = 0.9;
const INITIAL_POP_MIN = -5;
const INITIAL_POP_MAX = -8;
const INITIAL_HORIZONTAL_RANGE = 3;
const INITIAL_SPIN = 4;
const SCROLL_IMPULSE_MIN = 7;
const SCROLL_IMPULSE_MAX = 12;
const SCROLL_HORIZONTAL_RANGE = 1.5;

export type TrafficLightPhysicsState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  angularVelocity: number;
  isResting: boolean;
};

type TrafficLightPhysicsOrigin = {
  left: number;
  top: number;
};

type TrafficLightPhysicsBounds = {
  floor: number;
  rightWall: number;
};

export const createTrafficLightPhysicsState = (
  origin: TrafficLightPhysicsOrigin | null | undefined,
  random: () => number = Math.random,
): TrafficLightPhysicsState => ({
  x: origin?.left ?? 0,
  y: origin?.top ?? 0,
  vx: (random() - 0.5) * 2 * INITIAL_HORIZONTAL_RANGE,
  vy: INITIAL_POP_MIN + random() * (INITIAL_POP_MAX - INITIAL_POP_MIN),
  rotation: 0,
  angularVelocity: (random() - 0.5) * 2 * INITIAL_SPIN,
  isResting: false,
});

export const stepTrafficLightPhysicsState = (
  state: TrafficLightPhysicsState,
  bounds: TrafficLightPhysicsBounds,
) => {
  if (state.isResting) {
    return state;
  }

  state.vy += GRAVITY;
  state.vx *= AIR_FRICTION;
  state.x += state.vx;
  state.y += state.vy;
  state.rotation += state.angularVelocity;

  if (state.y >= bounds.floor) {
    state.y = bounds.floor;
    state.vx *= GROUND_FRICTION;

    if (Math.abs(state.vy) < REST_VELOCITY) {
      state.vy = 0;
      state.angularVelocity = 0;

      if (Math.abs(state.vx) < 0.3) {
        state.vx = 0;
        state.isResting = true;
      }
    } else {
      state.vy = -state.vy * BOUNCE_DAMPING;
      state.angularVelocity *= 0.7;
    }
  }

  if (state.x < 0) {
    state.x = 0;
    state.vx = -state.vx * BOUNCE_DAMPING;
  } else if (state.x > bounds.rightWall) {
    state.x = bounds.rightWall;
    state.vx = -state.vx * BOUNCE_DAMPING;
  }

  return state;
};

export const disturbTrafficLightPhysicsState = (
  state: TrafficLightPhysicsState,
  random: () => number = Math.random,
) => {
  state.isResting = false;
  state.vy = -(
    SCROLL_IMPULSE_MIN +
    random() * (SCROLL_IMPULSE_MAX - SCROLL_IMPULSE_MIN)
  );
  state.vx += (random() - 0.5) * 2 * SCROLL_HORIZONTAL_RANGE;
  state.angularVelocity += (random() - 0.5) * 8;

  return state;
};
