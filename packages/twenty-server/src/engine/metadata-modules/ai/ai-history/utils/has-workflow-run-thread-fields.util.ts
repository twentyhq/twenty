import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

// Fence for the 2.44 cross-upgrade window: until
// upgrade:2-44:add-workflow-run-to-chat-threads has reached a workspace, its
// threads have no column to name a workflow run, so no run conversation can be
// written and none has to be filtered out. Remove once 2.44 leaves the window.
export const hasWorkflowRunThreadFields = (
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): boolean =>
  isDefined(
    flatFieldMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.fields.workflowRun.universalIdentifier
    ],
  );
