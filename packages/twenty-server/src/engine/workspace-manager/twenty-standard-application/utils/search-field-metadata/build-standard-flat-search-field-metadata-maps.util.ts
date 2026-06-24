import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildAttachmentStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-attachment-standard-flat-search-field-metadata.util';
import { buildBlocklistStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-blocklist-standard-flat-search-field-metadata.util';
import { buildCalendarChannelEventAssociationStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-calendar-channel-event-association-standard-flat-search-field-metadata.util';
import { buildCalendarEventParticipantStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-calendar-event-participant-standard-flat-search-field-metadata.util';
import { buildCalendarEventStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-calendar-event-standard-flat-search-field-metadata.util';
import { buildCallRecordingStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-call-recording-standard-flat-search-field-metadata.util';
import { buildCompanyStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-company-standard-flat-search-field-metadata.util';
import { buildDashboardStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-dashboard-standard-flat-search-field-metadata.util';
import { buildMessageCampaignStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-campaign-standard-flat-search-field-metadata.util';
import { buildMessageChannelMessageAssociationStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-channel-message-association-standard-flat-search-field-metadata.util';
import { buildMessageListStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-list-standard-flat-search-field-metadata.util';
import { buildMessageParticipantStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-participant-standard-flat-search-field-metadata.util';
import { buildMessageStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-standard-flat-search-field-metadata.util';
import { buildMessageThreadStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-thread-standard-flat-search-field-metadata.util';
import { buildNoteStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-note-standard-flat-search-field-metadata.util';
import { buildOpportunityStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-opportunity-standard-flat-search-field-metadata.util';
import { buildPersonStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-person-standard-flat-search-field-metadata.util';
import { buildTaskStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-task-standard-flat-search-field-metadata.util';
import { buildTimelineActivityStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-timeline-activity-standard-flat-search-field-metadata.util';
import { buildWorkflowRunStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workflow-run-standard-flat-search-field-metadata.util';
import { buildWorkflowStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workflow-standard-flat-search-field-metadata.util';
import { buildWorkflowVersionStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workflow-version-standard-flat-search-field-metadata.util';
import { buildWorkspaceMemberStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workspace-member-standard-flat-search-field-metadata.util';
import { type CreateStandardSearchFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

type StandardSearchFieldBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardSearchFieldArgs<P>, 'context'>,
) => FlatSearchFieldMetadata[];

// Rows are emitted for every object whose searchVector indexes a meaningful field,
// not just the isSearchable ones: object-level isSearchable only gates global search,
// while scoped/record-picker search (and the searchVector column itself) is decoupled
// from it. Each object's field set mirrors its searchVector asExpression, built from
// the same SEARCH_FIELDS_FOR_* constant.
// Intentionally excluded: objects whose searchVector indexes only `id` or nothing
// (noteTarget, taskTarget, messageListMember, workflowAutomatedTrigger,
// messageChannelMessageAssociationMessageFolder) — these carry no searchable text.
// The searchVector column is kept; in a follow-up, with zero search field metadata
// rows it derives to `to_tsvector('simple', NULL)` and drops its GIN index, rather
// than being removed.
const STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: buildAttachmentStandardFlatSearchFieldMetadatas,
  blocklist: buildBlocklistStandardFlatSearchFieldMetadatas,
  calendarChannelEventAssociation:
    buildCalendarChannelEventAssociationStandardFlatSearchFieldMetadatas,
  calendarEvent: buildCalendarEventStandardFlatSearchFieldMetadatas,
  calendarEventParticipant:
    buildCalendarEventParticipantStandardFlatSearchFieldMetadatas,
  callRecording: buildCallRecordingStandardFlatSearchFieldMetadatas,
  company: buildCompanyStandardFlatSearchFieldMetadatas,
  dashboard: buildDashboardStandardFlatSearchFieldMetadatas,
  message: buildMessageStandardFlatSearchFieldMetadatas,
  messageCampaign: buildMessageCampaignStandardFlatSearchFieldMetadatas,
  messageChannelMessageAssociation:
    buildMessageChannelMessageAssociationStandardFlatSearchFieldMetadatas,
  messageList: buildMessageListStandardFlatSearchFieldMetadatas,
  messageParticipant: buildMessageParticipantStandardFlatSearchFieldMetadatas,
  messageThread: buildMessageThreadStandardFlatSearchFieldMetadatas,
  note: buildNoteStandardFlatSearchFieldMetadatas,
  opportunity: buildOpportunityStandardFlatSearchFieldMetadatas,
  person: buildPersonStandardFlatSearchFieldMetadatas,
  task: buildTaskStandardFlatSearchFieldMetadatas,
  timelineActivity: buildTimelineActivityStandardFlatSearchFieldMetadatas,
  workflow: buildWorkflowStandardFlatSearchFieldMetadatas,
  workflowRun: buildWorkflowRunStandardFlatSearchFieldMetadatas,
  workflowVersion: buildWorkflowVersionStandardFlatSearchFieldMetadatas,
  workspaceMember: buildWorkspaceMemberStandardFlatSearchFieldMetadatas,
} satisfies {
  [P in AllStandardObjectName]?: StandardSearchFieldBuilder<P>;
};

export const buildStandardFlatSearchFieldMetadataMaps = (
  args: Omit<CreateStandardSearchFieldArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatSearchFieldMetadata> => {
  const allSearchFieldMetadatas: FlatSearchFieldMetadata[] = (
    Object.keys(
      STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardSearchFieldBuilder<typeof objectName> =
      STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    return builder({
      ...args,
      objectName,
    });
  });

  let flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

  for (const searchFieldMetadata of allSearchFieldMetadatas) {
    flatSearchFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: searchFieldMetadata,
      flatEntityMaps: flatSearchFieldMetadataMaps,
    });
  }

  return flatSearchFieldMetadataMaps;
};
