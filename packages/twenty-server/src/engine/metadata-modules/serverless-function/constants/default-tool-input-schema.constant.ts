// Default tool input schema matching the base-typescript-project template
// Template params: { a: string; b: number; }
export const DEFAULT_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'number' },
  },
};
