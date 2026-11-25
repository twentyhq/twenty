import {
  type ExtendedUIMessagePart,
  mapAgentMessagePartToUIMessagePart,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

// the model is handed files by id, so a stored part needs no url here
export const mapDBPartToUIMessagePart = (
  part: AgentMessagePartWorkspaceEntity,
): ExtendedUIMessagePart | null =>
  mapAgentMessagePartToUIMessagePart({
    ...part,
    fileMediaType: part.file?.mimeType,
    fileUrl: null,
  });

export const mapDBPartsToUIMessageParts = (
  parts: AgentMessagePartWorkspaceEntity[],
): ExtendedUIMessagePart[] =>
  [...parts]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapDBPartToUIMessagePart)
    .filter(isDefined);
