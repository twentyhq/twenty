import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

// Keeps the summarizer input within a cheap model's window (~60k tokens).
const TRANSCRIPT_MAX_CHARS = 240_000;
const TRANSCRIPT_HEAD_RATIO = 0.25;
const TOOL_PAYLOAD_MAX_CHARS = 2_000;
const TRUNCATION_MARKER = '\n\n[... earlier messages truncated ...]\n\n';

type ToolLikePart = {
  type: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

const stringifyPayload = (payload: unknown): string => {
  if (payload === undefined || payload === null) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return String(payload);
  }
};

const truncatePayload = (payload: string): string =>
  payload.length > TOOL_PAYLOAD_MAX_CHARS
    ? `${payload.slice(0, TOOL_PAYLOAD_MAX_CHARS)}…[truncated]`
    : payload;

const serializeToolPart = (part: ToolLikePart): string => {
  const toolName =
    part.type === 'dynamic-tool'
      ? (part.toolName ?? 'unknown')
      : part.type.replace(/^tool-/, '');

  const lines = [`[tool: ${toolName}]`];
  const input = stringifyPayload(part.input);

  if (isNonEmptyString(input)) {
    lines.push(`input: ${truncatePayload(input)}`);
  }

  const output = stringifyPayload(part.output);

  if (isNonEmptyString(output)) {
    lines.push(`output: ${truncatePayload(output)}`);
  }

  if (isNonEmptyString(part.errorText)) {
    lines.push(`error: ${truncatePayload(part.errorText)}`);
  }

  return lines.join('\n');
};

const serializeMessage = (message: ExtendedUIMessage): string | null => {
  const serializedParts = message.parts
    .map((part) => {
      if (part.type === 'text' && isNonEmptyString(part.text)) {
        return part.text;
      }

      if (part.type === 'file') {
        return `[file: ${part.filename ?? part.url} (${part.mediaType})]`;
      }

      if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
        return serializeToolPart(part as ToolLikePart);
      }

      return null;
    })
    .filter((serializedPart): serializedPart is string =>
      isNonEmptyString(serializedPart),
    );

  if (serializedParts.length === 0) {
    return null;
  }

  return `[${message.role}]\n${serializedParts.join('\n')}`;
};

export const buildCompactionTranscript = (
  messages: ExtendedUIMessage[],
): string => {
  const transcript = messages
    .map(serializeMessage)
    .filter((serializedMessage): serializedMessage is string =>
      isNonEmptyString(serializedMessage),
    )
    .join('\n\n');

  if (transcript.length <= TRANSCRIPT_MAX_CHARS) {
    return transcript;
  }

  // The head carries the original goal, the tail the most recent work; the
  // middle is the safest to drop.
  const headLength = Math.floor(TRANSCRIPT_MAX_CHARS * TRANSCRIPT_HEAD_RATIO);
  const tailLength = TRANSCRIPT_MAX_CHARS - headLength;

  return `${transcript.slice(0, headLength)}${TRUNCATION_MARKER}${transcript.slice(transcript.length - tailLength)}`;
};
