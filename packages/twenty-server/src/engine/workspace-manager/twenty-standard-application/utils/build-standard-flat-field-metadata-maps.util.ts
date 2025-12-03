import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildAttachmentStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-attachment-standard-flat-field-metadata.util';
import { buildBlocklistStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-blocklist-standard-flat-field-metadata.util';
import { buildCalendarChannelEventAssociationStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-channel-event-association-standard-flat-field-metadata.util';
import { buildCalendarChannelStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-channel-standard-flat-field-metadata.util';
import { buildCalendarEventParticipantStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-event-participant-standard-flat-field-metadata.util';
import { buildCalendarEventStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-event-standard-flat-field-metadata.util';
import { buildCompanyStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-company-standard-flat-field-metadata.util';
import { buildConnectedAccountStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-connected-account-standard-flat-field-metadata.util';
import { buildDashboardStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-dashboard-standard-flat-field-metadata.util';
import { buildFavoriteFolderStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-favorite-folder-standard-flat-field-metadata.util';
import { buildFavoriteStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-favorite-standard-flat-field-metadata.util';
import { buildMessageChannelMessageAssociationStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-channel-message-association-standard-flat-field-metadata.util';
import { buildMessageChannelStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-channel-standard-flat-field-metadata.util';
import { buildMessageFolderStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-folder-standard-flat-field-metadata.util';
import { buildMessageParticipantStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-participant-standard-flat-field-metadata.util';
import { buildMessageStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-standard-flat-field-metadata.util';
import { buildMessageThreadStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-thread-standard-flat-field-metadata.util';
import { buildNoteStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-note-standard-flat-field-metadata.util';
import { buildNoteTargetStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-note-target-standard-flat-field-metadata.util';
import { buildOpportunityStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-opportunity-standard-flat-field-metadata.util';
import { buildPersonStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-person-standard-flat-field-metadata.util';
import { buildTaskStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-task-standard-flat-field-metadata.util';
import { buildTaskTargetStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-task-target-standard-flat-field-metadata.util';
import { buildTimelineActivityStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-timeline-activity-standard-flat-field-metadata.util';
import { buildWorkflowAutomatedTriggerStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-automated-trigger-standard-flat-field-metadata.util';
import { buildWorkflowRunStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-run-standard-flat-field-metadata.util';
import { buildWorkflowStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-standard-flat-field-metadata.util';
import { buildWorkflowVersionStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-version-standard-flat-field-metadata.util';
import { buildWorkspaceMemberStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workspace-member-standard-flat-field-metadata.util';
import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

type BuildStandardFlatFieldMetadataMapsArgs = {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

type StandardFlatFieldMetadataBuilder = (
  args: BuildStandardFlatFieldMetadataMapsArgs,
) => Record<string, FlatFieldMetadata>;

const STANDARD_FLAT_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: buildAttachmentStandardFlatFieldMetadatas,
  blocklist: buildBlocklistStandardFlatFieldMetadatas,
  calendarChannelEventAssociation:
    buildCalendarChannelEventAssociationStandardFlatFieldMetadatas,
  calendarChannel: buildCalendarChannelStandardFlatFieldMetadatas,
  calendarEventParticipant:
    buildCalendarEventParticipantStandardFlatFieldMetadatas,
  calendarEvent: buildCalendarEventStandardFlatFieldMetadatas,
  company: buildCompanyStandardFlatFieldMetadatas,
  connectedAccount: buildConnectedAccountStandardFlatFieldMetadatas,
  dashboard: buildDashboardStandardFlatFieldMetadatas,
  favorite: buildFavoriteStandardFlatFieldMetadatas,
  favoriteFolder: buildFavoriteFolderStandardFlatFieldMetadatas,
  message: buildMessageStandardFlatFieldMetadatas,
  messageChannel: buildMessageChannelStandardFlatFieldMetadatas,
  messageChannelMessageAssociation:
    buildMessageChannelMessageAssociationStandardFlatFieldMetadatas,
  messageFolder: buildMessageFolderStandardFlatFieldMetadatas,
  messageParticipant: buildMessageParticipantStandardFlatFieldMetadatas,
  messageThread: buildMessageThreadStandardFlatFieldMetadatas,
  note: buildNoteStandardFlatFieldMetadatas,
  noteTarget: buildNoteTargetStandardFlatFieldMetadatas,
  opportunity: buildOpportunityStandardFlatFieldMetadatas,
  person: buildPersonStandardFlatFieldMetadatas,
  task: buildTaskStandardFlatFieldMetadatas,
  taskTarget: buildTaskTargetStandardFlatFieldMetadatas,
  timelineActivity: buildTimelineActivityStandardFlatFieldMetadatas,
  workflow: buildWorkflowStandardFlatFieldMetadatas,
  workflowAutomatedTrigger:
    buildWorkflowAutomatedTriggerStandardFlatFieldMetadatas,
  workflowRun: buildWorkflowRunStandardFlatFieldMetadatas,
  workflowVersion: buildWorkflowVersionStandardFlatFieldMetadatas,
  workspaceMember: buildWorkspaceMemberStandardFlatFieldMetadatas,
} satisfies Record<AllStandardObjectName, StandardFlatFieldMetadataBuilder>;

const createEmptyFlatFieldMetadataMaps = (): FlatEntityMaps<FlatFieldMetadata> => ({
  byId: {},
  idByUniversalIdentifier: {},
  universalIdentifiersByApplicationId: {},
});

export const buildStandardFlatFieldMetadataMaps = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: BuildStandardFlatFieldMetadataMapsArgs): FlatEntityMaps<FlatFieldMetadata> => {
  const builderArgs = {
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  };

  // Collect all field metadatas from all standard objects
  const allFieldMetadatas: FlatFieldMetadata[] = Object.values(
    STANDARD_FLAT_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME,
  ).flatMap((builder) => Object.values(builder(builderArgs)));

  // Build maps using addFlatEntityToFlatEntityMapsOrThrow to prevent duplicate IDs
  let flatFieldMetadataMaps = createEmptyFlatFieldMetadataMaps();

  for (const fieldMetadata of allFieldMetadatas) {
    flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: fieldMetadata,
      flatEntityMaps: flatFieldMetadataMaps,
    });
  }

  return flatFieldMetadataMaps;
};
