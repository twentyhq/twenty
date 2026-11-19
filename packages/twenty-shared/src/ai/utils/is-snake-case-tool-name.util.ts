const SNAKE_CASE_TOOL_NAME_PATTERN = /^[a-z][a-z0-9_]*$/;

export const isSnakeCaseToolName = (toolName: string): boolean =>
  SNAKE_CASE_TOOL_NAME_PATTERN.test(toolName);
