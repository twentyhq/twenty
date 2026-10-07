import type { DatabaseEventActor } from 'twenty-shared/database-events';

import type { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type WorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId: string;
  objectMetadata: FlatObjectMetadata;
  actor?: DatabaseEventActor;
  events: WorkspaceEvent[];
};
