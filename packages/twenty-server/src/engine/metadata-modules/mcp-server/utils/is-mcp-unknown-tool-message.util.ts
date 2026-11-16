const UNKNOWN_TOOL_MESSAGE_PATTERN = /unknown tool|\btool\b[^:\n]*\bnot found/i;

export const isMcpUnknownToolMessage = (message: string): boolean =>
  UNKNOWN_TOOL_MESSAGE_PATTERN.test(message);
