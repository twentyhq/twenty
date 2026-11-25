import { AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-message-part-types-shown-to-others.constant';

export const filterPartsOfTurnActedByOthers = <TPart extends { type: string }>(
  parts: TPart[],
): TPart[] =>
  parts.filter(({ type }) =>
    AGENT_MESSAGE_PART_TYPES_SHOWN_TO_OTHERS.has(type),
  );
