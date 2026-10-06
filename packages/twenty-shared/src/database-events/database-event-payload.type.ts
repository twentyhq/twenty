import { type WorkspaceSignalName } from '@/application/constants/WorkspaceSignalNames';
import { type DatabaseEventActor } from '@/database-events/database-event-actor-type';
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
  dataSourceId: string | null;
  overrides: null;
  isCustom: boolean;
  isRemote: boolean;
  isActive: boolean;
  isSystem: boolean;
  isUIEditable: boolean;
  isUICreatable: boolean;
  isAuditLogged: boolean;
  isSearchable: boolean;
  duplicateCriteria: string[] | null;
  shortcut: string | null;
  labelIdentifierFieldMetadataId: string;
  imageIdentifierFieldMetadataId: string | null;
  isLabelSyncedWithName: boolean;
  createdAt: string;
  updatedAt: string;
  fieldIds: string[];
  indexMetadataIds: string[];
  viewIds: string[];
  applicationUniversalIdentifier: string | null;
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  imageIdentifierFieldMetadataUniversalIdentifier: string | null;
  fieldUniversalIdentifiers: string[];
  indexMetadataUniversalIdentifiers: string[];
  viewUniversalIdentifiers: string[];
};

type DatabaseEventMetadata = {
  name: string;
  workspaceId: string;
  objectMetadata: SimplifiedFlatObjectMetadata;
  // Absent on events emitted before the actor was recorded.
  actor?: DatabaseEventActor;
};

// Set on the single catch-up delivery a trigger with onMismatch
// 'deferUntilMatch' receives once its signal clears. The events it missed are
// not replayed: the handler re-reads whatever changed since `since`.
export type DeferredDatabaseEventBatch = {
  signal: WorkspaceSignalName;
  since: string;
  droppedEventCount: number;
};

export type DatabaseEventPayload<T = ObjectRecordEvent> =
  DatabaseEventMetadata & T;

export type DatabaseEventBatchPayload<T = ObjectRecordEvent> =
  DatabaseEventMetadata & {
    events: T[];
    deferred?: DeferredDatabaseEventBatch;
  };
