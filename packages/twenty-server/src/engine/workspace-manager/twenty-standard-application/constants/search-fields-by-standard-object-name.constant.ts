import { FieldMetadataType } from 'twenty-shared/types';

import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';

// Single source of truth for every standard object's searchVector field set.
// The Record is keyed by AllStandardObjectName, so the compiler forces every standard
// object to declare its list. Both consumers read from here: the searchVector
// asExpression (compute-*-standard-flat-field-metadata builders) and the
// searchFieldMetadata rows (build-standard-flat-search-field-metadata-maps).
// Junction objects with no searchable text field index their UUID id (their label
// identifier); objects whose searchVector indexes nothing keep an empty list.
export const SEARCH_FIELDS_BY_STANDARD_OBJECT_NAME = {
  attachment: [{ name: 'name', type: FieldMetadataType.TEXT }],
  blocklist: [{ name: 'handle', type: FieldMetadataType.TEXT }],
  calendarChannelEventAssociation: [
    { name: 'eventExternalId', type: FieldMetadataType.TEXT },
  ],
  calendarEvent: [{ name: 'title', type: FieldMetadataType.TEXT }],
  calendarEventParticipant: [{ name: 'handle', type: FieldMetadataType.TEXT }],
  callRecording: [{ name: 'title', type: FieldMetadataType.TEXT }],
  company: [
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'domainName', type: FieldMetadataType.LINKS },
  ],
  dashboard: [{ name: 'title', type: FieldMetadataType.TEXT }],
  message: [{ name: 'subject', type: FieldMetadataType.TEXT }],
  messageCampaign: [{ name: 'subject', type: FieldMetadataType.TEXT }],
  messageChannelMessageAssociation: [
    { name: 'messageExternalId', type: FieldMetadataType.TEXT },
  ],
  messageChannelMessageAssociationMessageFolder: [],
  messageList: [{ name: 'name', type: FieldMetadataType.TEXT }],
  messageListMember: [{ name: 'id', type: FieldMetadataType.UUID }],
  messageParticipant: [{ name: 'handle', type: FieldMetadataType.TEXT }],
  messageThread: [{ name: 'subject', type: FieldMetadataType.TEXT }],
  note: [
    { name: 'title', type: FieldMetadataType.TEXT },
    { name: 'bodyV2', type: FieldMetadataType.RICH_TEXT },
  ],
  noteTarget: [{ name: 'id', type: FieldMetadataType.UUID }],
  opportunity: [{ name: 'name', type: FieldMetadataType.TEXT }],
  person: [
    { name: 'name', type: FieldMetadataType.FULL_NAME },
    { name: 'emails', type: FieldMetadataType.EMAILS },
    { name: 'phones', type: FieldMetadataType.PHONES },
    { name: 'jobTitle', type: FieldMetadataType.TEXT },
  ],
  task: [
    { name: 'title', type: FieldMetadataType.TEXT },
    { name: 'bodyV2', type: FieldMetadataType.RICH_TEXT },
  ],
  taskTarget: [{ name: 'id', type: FieldMetadataType.UUID }],
  timelineActivity: [{ name: 'name', type: FieldMetadataType.TEXT }],
  workflow: [{ name: 'name', type: FieldMetadataType.TEXT }],
  workflowAutomatedTrigger: [{ name: 'id', type: FieldMetadataType.UUID }],
  workflowRun: [{ name: 'name', type: FieldMetadataType.TEXT }],
  workflowVersion: [{ name: 'name', type: FieldMetadataType.TEXT }],
  workspaceMember: [
    { name: 'name', type: FieldMetadataType.FULL_NAME },
    { name: 'userEmail', type: FieldMetadataType.TEXT },
  ],
} satisfies Record<AllStandardObjectName, FieldTypeAndNameMetadata[]>;
