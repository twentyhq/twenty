import type {
  HalftoneExportPose,
  HalftoneStudioSettings,
} from '@/lib/halftone/utils/state';

export type HalftoneInteractionState = {
  activePointerId: number | null;
  autoElapsed: number;
  dragging: boolean;
  hoverStrength: number;
  mouseX: number;
  mouseY: number;
  pointerInside: boolean;
  pointerVelocityX: number;
  pointerVelocityY: number;
  pointerX: number;
  pointerY: number;
  rotateElapsed: number;
  rotationVelocityX: number;
  rotationVelocityY: number;
  rotationVelocityZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  smoothedMouseX: number;
  smoothedMouseY: number;
  targetRotationX: number;
  targetRotationY: number;
  velocityX: number;
  velocityY: number;
};

export const createHalftoneInteractionState = (
  initialPose?: Partial<HalftoneExportPose>,
): HalftoneInteractionState => ({
  activePointerId: null,
  autoElapsed: initialPose?.autoElapsed ?? 0,
  dragging: false,
  hoverStrength: 0,
  mouseX: 0.5,
  mouseY: 0.5,
  pointerInside: false,
  pointerVelocityX: 0,
  pointerVelocityY: 0,
  pointerX: 0,
  pointerY: 0,
  rotateElapsed: initialPose?.rotateElapsed ?? 0,
  rotationVelocityX: 0,
  rotationVelocityY: 0,
  rotationVelocityZ: 0,
  rotationX: initialPose?.rotationX ?? 0,
  rotationY: initialPose?.rotationY ?? 0,
  rotationZ: initialPose?.rotationZ ?? 0,
  smoothedMouseX: 0.5,
  smoothedMouseY: 0.5,
  targetRotationX: initialPose?.targetRotationX ?? 0,
  targetRotationY: initialPose?.targetRotationY ?? 0,
  velocityX: 0,
  velocityY: 0,
});

export const applySpringStep = ({
  current,
  damping,
  strength,
  target,
  velocity,
}: {
  current: number;
  damping: number;
  strength: number;
  target: number;
  velocity: number;
}) => {
  const nextVelocity = (velocity + (target - current) * strength) * damping;

  return {
    value: current + nextVelocity,
    velocity: nextVelocity,
  };
};

export const resetHalftoneInteractionState = (
  interactionState: HalftoneInteractionState,
  animation: HalftoneStudioSettings['animation'],
) => {
  interactionState.activePointerId = null;
  interactionState.dragging = false;
  interactionState.hoverStrength = 0;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.pointerInside = false;
  interactionState.pointerVelocityX = 0;
  interactionState.pointerVelocityY = 0;
  interactionState.smoothedMouseX = 0.5;
  interactionState.smoothedMouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;

  if (animation.autoRotateEnabled) {
    interactionState.autoElapsed = 0;
  }
};

// Runtime JS string equivalents for standalone exported HTML.
// Used by the exporter to avoid maintaining parallel inline copies.
export const SPRING_STEP_RUNTIME_SOURCE = `
function applySpringStep(current, target, velocity, strength, damping) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  return { value: current + nextVelocity, velocity: nextVelocity };
}`;

export const RESET_INTERACTION_STATE_RUNTIME_SOURCE = `
function resetInteractionState(interactionState) {
  interactionState.dragging = false;
  interactionState.mouseX = 0.5;
  interactionState.mouseY = 0.5;
  interactionState.targetRotationX = 0;
  interactionState.targetRotationY = 0;
  interactionState.velocityX = 0;
  interactionState.velocityY = 0;
  interactionState.rotationVelocityX = 0;
  interactionState.rotationVelocityY = 0;
  interactionState.rotationVelocityZ = 0;
  interactionState.autoElapsed = 0;
}`;
