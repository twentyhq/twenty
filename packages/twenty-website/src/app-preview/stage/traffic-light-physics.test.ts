import {
  trafficLightPhysics,
  type TrafficLightPhysicsState,
} from './traffic-light-physics';

const createRandomSequence = (values: number[]) => {
  let index = 0;

  return () => values[index++] ?? values[values.length - 1] ?? 0.5;
};

describe('trafficLightPhysics', () => {
  it('should create deterministic launch state from an element origin', () => {
    expect(
      trafficLightPhysics.createState(
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

  it('should mark a dot as resting when the floor impact is below the rest threshold', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 1,
      isResting: false,
      rotation: 0,
      vx: 0.1,
      vy: 0.1,
      x: 0,
      y: 100,
    };

    trafficLightPhysics.step(state, { floor: 100, rightWall: 500 });

    expect(state).toMatchObject({
      angularVelocity: 0,
      isResting: true,
      vx: 0,
      vy: 0,
      y: 100,
    });
  });

  it('should clamp side-wall collisions and reflect horizontal velocity', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 0,
      isResting: false,
      rotation: 0,
      vx: 10,
      vy: -1,
      x: 98,
      y: 0,
    };

    trafficLightPhysics.step(state, { floor: 500, rightWall: 100 });

    expect(state.x).toBe(100);
    expect(state.vx).toBeLessThan(0);
  });

  it('should apply a scroll disturbance and clear resting state', () => {
    const state: TrafficLightPhysicsState = {
      angularVelocity: 0,
      isResting: true,
      rotation: 0,
      vx: 1,
      vy: 0,
      x: 0,
      y: 100,
    };

    trafficLightPhysics.disturb(state, createRandomSequence([0, 1, 0.5]));

    expect(state).toMatchObject({
      angularVelocity: 0,
      isResting: false,
      vx: 2.5,
      vy: -7,
    });
  });
});
