import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// isSubscribed and assignee are created by the last 2.46 chat commands, so
// they only exist once the inbox backfill and the agentTurn run fields are in
// place. doneAt is created by add-agent-chat-thread-participant-done-at, after
// them on workspaces that already had the participant object.
const AGENT_HISTORY_UPGRADED_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentTurn.fields.status.universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.isSubscribed
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastMentionedAt
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.doneAt.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.assignee.universalIdentifier,
];

// Fence for the 2.46 cross-upgrade window: a workspace the 2.46 chat commands
// have not reached yet lacks the participant object, the thread's inbox
// columns and the agentTurn run fields. Remove once 2.46 leaves the window.
@Injectable()
export class AgentHistoryUpgradeFenceService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async hasUpgradedAgentHistory(workspaceId: string): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return AGENT_HISTORY_UPGRADED_FIELD_UNIVERSAL_IDENTIFIERS.every(
      (universalIdentifier) =>
        isDefined(
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }),
        ),
    );
  }
}
