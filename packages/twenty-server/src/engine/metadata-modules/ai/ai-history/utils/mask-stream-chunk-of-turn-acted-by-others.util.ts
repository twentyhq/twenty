import { isString } from '@sniptt/guards';

import { AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-message-part-types-shown-to-others.constant';

const MESSAGE_FRAME_CHUNK_TYPES = new Set([
  'start',
  'finish',
  'message-metadata',
  'abort',
]);

// a part streams as `<part type>`, or as its `-start`, `-delta` and `-end` chunks
const toStreamedPartType = (chunkType: string) =>
  chunkType.replace(/-(start|delta|end)$/, '');

// replaced rather than dropped, so seq stays gapless for replay
export const maskStreamChunkOfTurnActedByOthers = (
  chunk: Record<string, unknown>,
): Record<string, unknown> =>
  isString(chunk.type) &&
  (MESSAGE_FRAME_CHUNK_TYPES.has(chunk.type) ||
    AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS.has(
      toStreamedPartType(chunk.type),
    ))
    ? chunk
    : { type: 'message-metadata', messageMetadata: {} };
