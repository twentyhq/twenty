import { HALFTONE_INTERACTION } from './interaction-state';
import { HALFTONE_STUDIO_DEFAULTS } from './studio-settings-defaults';

describe('halftone interaction state', () => {
  it('hydrates pose fields while defaulting transient pointer state', () => {
    expect(
      HALFTONE_INTERACTION.create({
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
      HALFTONE_INTERACTION.springStep({
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
    const interaction = HALFTONE_INTERACTION.create({ autoElapsed: 10 });

    interaction.activePointerId = 7;
    interaction.dragging = true;
    interaction.mouseX = 0.1;
    interaction.pointerVelocityX = 2;
    interaction.rotationVelocityY = 3;
    interaction.targetRotationX = 4;

    HALFTONE_INTERACTION.reset(interaction, {
      ...HALFTONE_STUDIO_DEFAULTS.settings.animation,
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
    const interaction = HALFTONE_INTERACTION.create({ autoElapsed: 10 });

    HALFTONE_INTERACTION.reset(interaction, {
      ...HALFTONE_STUDIO_DEFAULTS.settings.animation,
      autoRotateEnabled: true,
    });

    expect(interaction.autoElapsed).toBe(0);
  });
});
