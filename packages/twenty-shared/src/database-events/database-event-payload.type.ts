import { type ObjectRecordEvent } from '@/database-events/object-record-event.event';

type SimplifiedFlatObjectMetadata = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string | null;
  icon: string | null;
  universalIdentifier: string;
  applicationId: string | null;
} & {
  fieldMetadataIds: string[];
  indexMetadataIds: string[];
  viewIds: string[];
};

type WorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId: string;
  objectMetadata: SimplifiedFlatObjectMetadata;
  events: WorkspaceEvent[];
};

export type DatabaseEventPayload<T = ObjectRecordEvent> = Omit<
  WorkspaceEventBatch<T>,
  'events'
> &
  T;
