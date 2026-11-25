import { isString } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-message-part-types-shown-to-others.constant';

const MESSAGE_FRAME_CHUNK_TYPES = new Set(['start', 'finish', 'abort']);
const PUBLIC_MESSAGE_METADATA_FIELDS = new Set([
  'agentId',
  'isBuiltInAssistant',
  'turnId',
]);

// a part streams as `<part type>`, or as its `-start`, `-delta` and `-end` chunks
const toStreamedPartType = (chunkType: string) =>
  chunkType.replace(/-(start|delta|end)$/, '');

const isChunkTypeShownToOthers = (chunkType: string) =>
  MESSAGE_FRAME_CHUNK_TYPES.has(chunkType) ||
  AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS.has(toStreamedPartType(chunkType));

// replaced rather than dropped, so seq stays gapless for replay
export const maskStreamChunkOfTurnActedByOthers = (
  chunk: Record<string, unknown>,
): Record<string, unknown> => {
  if (!isString(chunk.type) || !isChunkTypeShownToOthers(chunk.type)) {
    return { type: 'message-metadata', messageMetadata: {} };
  }

  // the turn's usage and credits ride on its metadata, which history keeps from other members too
  const { messageMetadata, ...visibleChunk } = chunk;
  const publicMetadataEntries = isPlainObject(messageMetadata)
    ? Object.entries(messageMetadata).filter(([key]) =>
        PUBLIC_MESSAGE_METADATA_FIELDS.has(key),
      )
    : [];

  return isNonEmptyArray(publicMetadataEntries)
    ? {
        ...visibleChunk,
        messageMetadata: Object.fromEntries(publicMetadataEntries),
      }
    : visibleChunk;
};
