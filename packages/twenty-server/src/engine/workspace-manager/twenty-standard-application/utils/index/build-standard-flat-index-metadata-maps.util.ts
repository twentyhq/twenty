import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildAttachmentStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-attachment-standard-flat-index-metadata.util';
import { buildBlocklistStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-blocklist-standard-flat-index-metadata.util';
import { buildCalendarChannelEventAssociationStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-calendar-channel-event-association-standard-flat-index-metadata.util';
import { buildCalendarEventParticipantStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-calendar-event-participant-standard-flat-index-metadata.util';
import { buildCallRecordingStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-call-recording-standard-flat-index-metadata.util';
import { buildCompanyStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-company-standard-flat-index-metadata.util';
import { buildDashboardStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-dashboard-standard-flat-index-metadata.util';
import { buildExternalEntityLinkStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-external-entity-link-standard-flat-index-metadata.util';
import { buildExternalSyncCheckpointStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-external-sync-checkpoint-standard-flat-index-metadata.util';
import { buildExternalSyncInboxStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-external-sync-inbox-standard-flat-index-metadata.util';
import { buildExternalSyncOutboxStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-external-sync-outbox-standard-flat-index-metadata.util';
import { buildMessageCampaignStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-campaign-standard-flat-index-metadata.util';
import { buildMessageListStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-list-standard-flat-index-metadata.util';
import { buildMessageListMemberStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-list-member-standard-flat-index-metadata.util';
import { buildMessageChannelMessageAssociationMessageFolderStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-channel-message-association-message-folder-standard-flat-index-metadata.util';
import { buildMessageChannelMessageAssociationStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-channel-message-association-standard-flat-index-metadata.util';
import { buildMessageParticipantStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-participant-standard-flat-index-metadata.util';
import { buildMessageStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-message-standard-flat-index-metadata.util';
import { buildNoteStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-note-standard-flat-index-metadata.util';
import { buildNoteTargetStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-note-target-standard-flat-index-metadata.util';
import { buildOpportunityStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-opportunity-standard-flat-index-metadata.util';
import { buildPersonStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-person-standard-flat-index-metadata.util';
import { buildTaskStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-task-standard-flat-index-metadata.util';
import { buildTaskTargetStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-task-target-standard-flat-index-metadata.util';
import { buildTimelineActivityStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-timeline-activity-standard-flat-index-metadata.util';
import { buildWorkflowAutomatedTriggerStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-workflow-automated-trigger-standard-flat-index-metadata.util';
import { buildWorkflowRunStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-workflow-run-standard-flat-index-metadata.util';
import { buildWorkflowStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-workflow-standard-flat-index-metadata.util';
import { buildWorkflowVersionStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-workflow-version-standard-flat-index-metadata.util';
import { buildWorkspaceMemberStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-workspace-member-standard-flat-index-metadata.util';
import { type CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

type StandardIndexBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardIndexArgs<P>, 'context'>,
) => Record<string, FlatIndexMetadata>;

const STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: buildAttachmentStandardFlatIndexMetadatas,
  blocklist: buildBlocklistStandardFlatIndexMetadatas,
  calendarChannelEventAssociation:
    buildCalendarChannelEventAssociationStandardFlatIndexMetadatas,
  calendarEventParticipant:
    buildCalendarEventParticipantStandardFlatIndexMetadatas,
  callRecording: buildCallRecordingStandardFlatIndexMetadatas,
  company: buildCompanyStandardFlatIndexMetadatas,
  dashboard: buildDashboardStandardFlatIndexMetadatas,
  externalEntityLink: buildExternalEntityLinkStandardFlatIndexMetadatas,
  externalSyncCheckpoint:
    buildExternalSyncCheckpointStandardFlatIndexMetadatas,
  externalSyncInbox: buildExternalSyncInboxStandardFlatIndexMetadatas,
  externalSyncOutbox: buildExternalSyncOutboxStandardFlatIndexMetadatas,
  messageCampaign: buildMessageCampaignStandardFlatIndexMetadatas,
  messageList: buildMessageListStandardFlatIndexMetadatas,
  messageListMember: buildMessageListMemberStandardFlatIndexMetadatas,
  message: buildMessageStandardFlatIndexMetadatas,
  messageChannelMessageAssociation:
    buildMessageChannelMessageAssociationStandardFlatIndexMetadatas,
  messageChannelMessageAssociationMessageFolder:
    buildMessageChannelMessageAssociationMessageFolderStandardFlatIndexMetadatas,
  messageParticipant: buildMessageParticipantStandardFlatIndexMetadatas,
  note: buildNoteStandardFlatIndexMetadatas,
  noteTarget: buildNoteTargetStandardFlatIndexMetadatas,
  opportunity: buildOpportunityStandardFlatIndexMetadatas,
  person: buildPersonStandardFlatIndexMetadatas,
  task: buildTaskStandardFlatIndexMetadatas,
  taskTarget: buildTaskTargetStandardFlatIndexMetadatas,
  timelineActivity: buildTimelineActivityStandardFlatIndexMetadatas,
  workflow: buildWorkflowStandardFlatIndexMetadatas,
  workflowAutomatedTrigger:
    buildWorkflowAutomatedTriggerStandardFlatIndexMetadatas,
  workflowRun: buildWorkflowRunStandardFlatIndexMetadatas,
  workflowVersion: buildWorkflowVersionStandardFlatIndexMetadatas,
  workspaceMember: buildWorkspaceMemberStandardFlatIndexMetadatas,
} satisfies {
  [P in AllStandardObjectName]?: StandardIndexBuilder<P>;
};

export const buildStandardFlatIndexMetadataMaps = (
  args: Omit<CreateStandardIndexArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatIndexMetadata> => {
  const allIndexMetadatas: FlatIndexMetadata[] = (
    Object.keys(
      STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardIndexBuilder<typeof objectName> =
      STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatIndexMetadataMaps = createEmptyFlatEntityMaps();

  for (const indexMetadata of allIndexMetadatas) {
    flatIndexMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: indexMetadata,
      flatEntityMaps: flatIndexMetadataMaps,
    });
  }

  return flatIndexMetadataMaps;
};
