// Untyped JS mirror of the interaction helpers, baked into exported standalone
// HTML/components. Keep in sync with engine/interaction-state.ts.
export const HALFTONE_INTERACTION_RUNTIME_SOURCE = {
  springStep: `
function applySpringStep(current, target, velocity, strength, damping) {
  const nextVelocity = (velocity + (target - current) * strength) * damping;
  return { value: current + nextVelocity, velocity: nextVelocity };
}`,
  reset: `
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
}`,
};
