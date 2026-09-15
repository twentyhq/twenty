import { type HalftoneAnimationSettings } from './halftone-settings';

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

export type HalftoneInitialPose = Partial<{
  autoElapsed: number;
  rotateElapsed: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  targetRotationX: number;
  targetRotationY: number;
}>;

const createState = (
  initialPose?: HalftoneInitialPose,
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

const springStep = ({
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

const resetState = (
  interactionState: HalftoneInteractionState,
  animation: HalftoneAnimationSettings,
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

// Pure pointer/rotation physics shared by every halftone scene.
export const halftoneInteraction = {
  create: createState,
  springStep,
  reset: resetState,
};
