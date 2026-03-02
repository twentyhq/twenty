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
  standardOverrides: null;
  isCustom: boolean;
  isRemote: boolean;
  isActive: boolean;
  isSystem: boolean;
  isUIReadOnly: boolean;
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

type WorkspaceEventBatch<WorkspaceEvent> = {
  name: string;
  workspaceId: string;
  objectMetadata: SimplifiedFlatObjectMetadata;
  userId: string;
  userWorkspaceId: string;
  workspaceMemberId: string;
  recordId: string;
  events: WorkspaceEvent[];
};

export type DatabaseEventPayload<T = ObjectRecordEvent> = Omit<
  WorkspaceEventBatch<T>,
  'events'
> &
  T;
