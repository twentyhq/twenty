import {
  createTrafficLightPhysicsState,
  disturbTrafficLightPhysicsState,
  stepTrafficLightPhysicsState,
  type TrafficLightPhysicsState,
} from '../utils/terminal-traffic-light-physics';

const createRandomSequence = (values: number[]) => {
  let index = 0;

  return () => values[index++] ?? values[values.length - 1] ?? 0.5;
};

describe('terminal traffic light physics', () => {
  it('creates deterministic launch state from an element origin', () => {
    expect(
      createTrafficLightPhysicsState(
        { left: 12, top: 24 },
        createRandomSequence([0.5, 0.5, 0.5]),
      ),
    ).toEqual({
      angularVelocity: 0,
      isResting: false,
      rotation: 0,
      vx: 0,
      vy: -6.5,
      x: 12,
      y: 24,
    });
  });

  it('marks a dot as resting when the floor impact is below the rest threshold', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 1,
      isResting: false,
      rotation: 0,
      vx: 0.1,
      vy: 0.1,
      x: 0,
      y: 100,
    };

    stepTrafficLightPhysicsState(state, { floor: 100, rightWall: 500 });

    expect(state).toMatchObject({
      angularVelocity: 0,
      isResting: true,
      vx: 0,
      vy: 0,
      y: 100,
    });
  });

  it('clamps side-wall collisions and reflects horizontal velocity', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 0,
      isResting: false,
      rotation: 0,
      vx: 10,
      vy: -1,
      x: 98,
      y: 0,
    };

    stepTrafficLightPhysicsState(state, { floor: 500, rightWall: 100 });

    expect(state.x).toBe(100);
    expect(state.vx).toBeLessThan(0);
  });

  it('applies a scroll disturbance and clears resting state', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 0,
      isResting: true,
      rotation: 0,
      vx: 1,
      vy: 0,
      x: 0,
      y: 100,
    };

    disturbTrafficLightPhysicsState(state, createRandomSequence([0, 1, 0.5]));

    expect(state).toMatchObject({
      angularVelocity: 0,
      isResting: false,
      vx: 2.5,
      vy: -7,
    });
  });
});
