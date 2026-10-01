import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Fence for the 2.45 cross-upgrade window: until
// upgrade:2-45:add-agent-chat-thread-participant-object has reached a
// workspace, it has neither the participant table nor the thread's
// lastActivityAt column. Remove once 2.45 leaves the window.
export const hasAgentChatThreadInboxState = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): boolean =>
  isDefined(
    flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier
    ],
  );
