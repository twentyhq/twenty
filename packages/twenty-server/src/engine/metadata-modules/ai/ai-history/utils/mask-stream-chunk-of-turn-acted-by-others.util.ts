import { isString } from '@sniptt/guards';

// the stream shows what the history does of such a turn: its text parts
const STREAM_CHUNK_TYPES_SHOWN_TO_OTHERS = new Set([
  'start',
  'finish',
  'text-start',
  'text-delta',
  'text-end',
  'message-metadata',
  'abort',
]);

// replaced rather than dropped, so seq stays gapless for replay
export const maskStreamChunkOfTurnActedByOthers = (
  chunk: Record<string, unknown>,
): Record<string, unknown> =>
  isString(chunk.type) && STREAM_CHUNK_TYPES_SHOWN_TO_OTHERS.has(chunk.type)
    ? chunk
    : { type: 'message-metadata', messageMetadata: {} };
