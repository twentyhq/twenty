import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/build-standard-flat-search-field-metadatas.util';
import { type CreateStandardSearchFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { SEARCH_FIELDS_FOR_ATTACHMENT } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { SEARCH_FIELDS_FOR_BLOCKLIST } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { SEARCH_FIELDS_FOR_CALENDAR_CHANNEL_EVENT_ASSOCIATION } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { SEARCH_FIELDS_FOR_CALENDAR_EVENT_PARTICIPANT } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { SEARCH_FIELDS_FOR_CALENDAR_EVENT } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { SEARCH_FIELDS_FOR_CALL_RECORDING } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';
import { SEARCH_FIELDS_FOR_DASHBOARD } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_CAMPAIGN } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_LIST_MEMBER } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_LIST } from 'src/modules/emailing/standard-objects/message-list.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_PARTICIPANT } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE_THREAD } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { SEARCH_FIELDS_FOR_MESSAGE } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTE_TARGET } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { SEARCH_FIELDS_FOR_NOTES } from 'src/modules/note/standard-objects/note.workspace-entity';
import { SEARCH_FIELDS_FOR_OPPORTUNITY } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { SEARCH_FIELDS_FOR_PERSON } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SEARCH_FIELDS_FOR_TASK_TARGET } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { SEARCH_FIELDS_FOR_TASKS } from 'src/modules/task/standard-objects/task.workspace-entity';
import { SEARCH_FIELDS_FOR_TIMELINE_ACTIVITY } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_AUTOMATED_TRIGGER } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_RUNS } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKFLOWS } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { SEARCH_FIELDS_FOR_WORKSPACE_MEMBER } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// Rows are emitted for every object that authors a non-empty searchVector, not just the
// isSearchable ones: object-level isSearchable only gates global search, while
// scoped/record-picker search (and the searchVector column itself) is decoupled from it.
// Each object's row set mirrors its searchVector asExpression, built from the same
// SEARCH_FIELDS_FOR_* constant. Junction objects with no searchable text field index
// their UUID id (their label identifier) so the rows still mirror the column.
const STANDARD_SEARCH_FIELDS_BY_OBJECT_NAME = {
  attachment: SEARCH_FIELDS_FOR_ATTACHMENT,
  blocklist: SEARCH_FIELDS_FOR_BLOCKLIST,
  calendarChannelEventAssociation:
    SEARCH_FIELDS_FOR_CALENDAR_CHANNEL_EVENT_ASSOCIATION,
  calendarEvent: SEARCH_FIELDS_FOR_CALENDAR_EVENT,
  calendarEventParticipant: SEARCH_FIELDS_FOR_CALENDAR_EVENT_PARTICIPANT,
  callRecording: SEARCH_FIELDS_FOR_CALL_RECORDING,
  company: SEARCH_FIELDS_FOR_COMPANY,
  dashboard: SEARCH_FIELDS_FOR_DASHBOARD,
  message: SEARCH_FIELDS_FOR_MESSAGE,
  messageCampaign: SEARCH_FIELDS_FOR_MESSAGE_CAMPAIGN,
  messageChannelMessageAssociation:
    SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION,
  messageList: SEARCH_FIELDS_FOR_MESSAGE_LIST,
  messageListMember: SEARCH_FIELDS_FOR_MESSAGE_LIST_MEMBER,
  messageParticipant: SEARCH_FIELDS_FOR_MESSAGE_PARTICIPANT,
  messageThread: SEARCH_FIELDS_FOR_MESSAGE_THREAD,
  note: SEARCH_FIELDS_FOR_NOTES,
  noteTarget: SEARCH_FIELDS_FOR_NOTE_TARGET,
  opportunity: SEARCH_FIELDS_FOR_OPPORTUNITY,
  person: SEARCH_FIELDS_FOR_PERSON,
  task: SEARCH_FIELDS_FOR_TASKS,
  taskTarget: SEARCH_FIELDS_FOR_TASK_TARGET,
  timelineActivity: SEARCH_FIELDS_FOR_TIMELINE_ACTIVITY,
  workflow: SEARCH_FIELDS_FOR_WORKFLOWS,
  workflowAutomatedTrigger: SEARCH_FIELDS_FOR_WORKFLOW_AUTOMATED_TRIGGER,
  workflowRun: SEARCH_FIELDS_FOR_WORKFLOW_RUNS,
  workflowVersion: SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS,
  workspaceMember: SEARCH_FIELDS_FOR_WORKSPACE_MEMBER,
} satisfies {
  [P in AllStandardObjectName]?: FieldTypeAndNameMetadata[];
};

export const buildStandardFlatSearchFieldMetadataMaps = (
  args: Omit<CreateStandardSearchFieldArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatSearchFieldMetadata> => {
  const allSearchFieldMetadatas: FlatSearchFieldMetadata[] = (
    Object.keys(
      STANDARD_SEARCH_FIELDS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_SEARCH_FIELDS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) =>
    buildStandardFlatSearchFieldMetadatas({
      ...args,
      objectName,
      searchFields: STANDARD_SEARCH_FIELDS_BY_OBJECT_NAME[objectName],
    }),
  );

  let flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

  for (const searchFieldMetadata of allSearchFieldMetadatas) {
    flatSearchFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: searchFieldMetadata,
      flatEntityMaps: flatSearchFieldMetadataMaps,
    });
  }

  return flatSearchFieldMetadataMaps;
};
