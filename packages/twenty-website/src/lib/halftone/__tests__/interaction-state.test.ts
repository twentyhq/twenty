import { DEFAULT_HALFTONE_SETTINGS } from '../utils/state';
import {
  applySpringStep,
  createHalftoneInteractionState,
  resetHalftoneInteractionState,
} from '../utils/interaction-state';

describe('halftone interaction state', () => {
  it('hydrates pose fields while defaulting transient pointer state', () => {
    expect(
      createHalftoneInteractionState({
        autoElapsed: 10,
        rotateElapsed: 2,
        rotationX: 0.1,
        rotationY: 0.2,
        rotationZ: 0.3,
        targetRotationX: 0.4,
        targetRotationY: 0.5,
      }),
    ).toMatchObject({
      activePointerId: null,
      autoElapsed: 10,
      mouseX: 0.5,
      pointerInside: false,
      rotateElapsed: 2,
      rotationX: 0.1,
      rotationY: 0.2,
      rotationZ: 0.3,
      targetRotationX: 0.4,
      targetRotationY: 0.5,
    });
  });

  it('applies one damped spring integration step', () => {
    expect(
      applySpringStep({
        current: 0,
        damping: 0.5,
        strength: 0.2,
        target: 10,
        velocity: 1,
      }),
    ).toEqual({
      value: 1.5,
      velocity: 1.5,
    });
  });

  it('resets pointer and velocity fields without always resetting elapsed auto rotation', () => {
    const interaction = createHalftoneInteractionState({ autoElapsed: 10 });

    interaction.activePointerId = 7;
    interaction.dragging = true;
    interaction.mouseX = 0.1;
    interaction.pointerVelocityX = 2;
    interaction.rotationVelocityY = 3;
    interaction.targetRotationX = 4;

    resetHalftoneInteractionState(interaction, {
      ...DEFAULT_HALFTONE_SETTINGS.animation,
      autoRotateEnabled: false,
    });

    expect(interaction).toMatchObject({
      activePointerId: null,
      autoElapsed: 10,
      dragging: false,
      mouseX: 0.5,
      pointerVelocityX: 0,
      rotationVelocityY: 0,
      targetRotationX: 0,
    });
  });

  it('resets auto rotation elapsed time when auto rotation is enabled', () => {
    const interaction = createHalftoneInteractionState({ autoElapsed: 10 });

    resetHalftoneInteractionState(interaction, {
      ...DEFAULT_HALFTONE_SETTINGS.animation,
      autoRotateEnabled: true,
    });

    expect(interaction.autoElapsed).toBe(0);
  });
});
