// Approximate node dimensions used when real measured sizes are unavailable
// (e.g. server-side layout). 240 matches the diagram node container max-width.
export const WORKFLOW_DIAGRAM_DEFAULT_NODE_DIMENSIONS = {
  width: 240,
  height: 52,
} as const;
