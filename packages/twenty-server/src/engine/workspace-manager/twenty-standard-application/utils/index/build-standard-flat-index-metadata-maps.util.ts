import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { type StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

export type BuildStandardFlatIndexMetadataMapsArgs = {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

type StandardFlatIndexMetadataBuilder = (
  args: BuildStandardFlatIndexMetadataMapsArgs,
) => Record<string, FlatIndexMetadata>;

const STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME = {
  // attachment: buildAttachmentStandardFlatIndexMetadatas,
  // blocklist: buildBlocklistStandardFlatIndexMetadatas,
  // calendarChannelEventAssociation: buildCalendarChannelEventAssociationStandardFlatIndexMetadatas,
  // calendarChannel: buildCalendarChannelStandardFlatIndexMetadatas,
  // calendarEventParticipant: buildCalendarEventParticipantStandardFlatIndexMetadatas,
  // calendarEvent: buildCalendarEventStandardFlatIndexMetadatas,
  // company: buildCompanyStandardFlatIndexMetadatas,
  // connectedAccount: buildConnectedAccountStandardFlatIndexMetadatas,
  // dashboard: buildDashboardStandardFlatIndexMetadatas,
  // favorite: buildFavoriteStandardFlatIndexMetadatas,
  // favoriteFolder: buildFavoriteFolderStandardFlatIndexMetadatas,
  // message: buildMessageStandardFlatIndexMetadatas,
  // messageChannel: buildMessageChannelStandardFlatIndexMetadatas,
  // messageChannelMessageAssociation: buildMessageChannelMessageAssociationStandardFlatIndexMetadatas,
  // messageFolder: buildMessageFolderStandardFlatIndexMetadatas,
  // messageParticipant: buildMessageParticipantStandardFlatIndexMetadatas,
  // messageThread: buildMessageThreadStandardFlatIndexMetadatas,
  // note: buildNoteStandardFlatIndexMetadatas,
  // noteTarget: buildNoteTargetStandardFlatIndexMetadatas,
  // opportunity: buildOpportunityStandardFlatIndexMetadatas,
  // person: buildPersonStandardFlatIndexMetadatas,
  // task: buildTaskStandardFlatIndexMetadatas,
  // taskTarget: buildTaskTargetStandardFlatIndexMetadatas,
  // timelineActivity: buildTimelineActivityStandardFlatIndexMetadatas,
  // workflow: buildWorkflowStandardFlatIndexMetadatas,
  // workflowAutomatedTrigger: buildWorkflowAutomatedTriggerStandardFlatIndexMetadatas,
  // workflowRun: buildWorkflowRunStandardFlatIndexMetadatas,
  // workflowVersion: buildWorkflowVersionStandardFlatIndexMetadatas,
  // workspaceMember: buildWorkspaceMemberStandardFlatIndexMetadatas,
} satisfies Partial<
  Record<AllStandardObjectName, StandardFlatIndexMetadataBuilder>
>;

const createEmptyFlatIndexMetadataMaps =
  (): FlatEntityMaps<FlatIndexMetadata> => ({
    byId: {},
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  });

export const buildStandardFlatIndexMetadataMaps = ({
  createdAt,
  workspaceId,
  standardFieldMetadataIdByObjectAndFieldName,
}: BuildStandardFlatIndexMetadataMapsArgs): FlatEntityMaps<FlatIndexMetadata> => {
  const builderArgs = {
    createdAt,
    workspaceId,
    standardFieldMetadataIdByObjectAndFieldName,
  };

  const allIndexMetadatas: FlatIndexMetadata[] = Object.values(
    STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME,
  ).flatMap((builder) => Object.values(builder(builderArgs)));

  let flatIndexMetadataMaps = createEmptyFlatIndexMetadataMaps();

  for (const indexMetadata of allIndexMetadatas) {
    flatIndexMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: indexMetadata,
      flatEntityMaps: flatIndexMetadataMaps,
    });
  }

  return flatIndexMetadataMaps;
};

