import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildCompanyStandardFlatIndexMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/compute-company-standard-flat-index-metadata.util';
import { CreateStandardIndexArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/index/create-standard-index-flat-metadata.util';

const STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME = {
  // attachment: buildAttachmentStandardFlatIndexMetadatas,
  // blocklist: buildBlocklistStandardFlatIndexMetadatas,
  // calendarChannelEventAssociation: buildCalendarChannelEventAssociationStandardFlatIndexMetadatas,
  // calendarChannel: buildCalendarChannelStandardFlatIndexMetadatas,
  // calendarEventParticipant: buildCalendarEventParticipantStandardFlatIndexMetadatas,
  // calendarEvent: buildCalendarEventStandardFlatIndexMetadatas,
  company: buildCompanyStandardFlatIndexMetadatas,
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
} satisfies {
  [P in AllStandardObjectName]?: (
    args: CreateStandardIndexArgs<P>,
  ) => Record<string, FlatIndexMetadata>;
};

const createEmptyFlatIndexMetadataMaps =
  (): FlatEntityMaps<FlatIndexMetadata> => ({
    byId: {},
    idByUniversalIdentifier: {},
    universalIdentifiersByApplicationId: {},
  });

export const buildStandardFlatIndexMetadataMaps = (
  args: Omit<CreateStandardIndexArgs, 'options'>,
): FlatEntityMaps<FlatIndexMetadata> => {
  const allIndexMetadatas: FlatIndexMetadata[] = (
    Object.keys(
      STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder =
      STANDARD_FLAT_INDEX_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatIndexMetadataMaps = createEmptyFlatIndexMetadataMaps();

  for (const indexMetadata of allIndexMetadatas) {
    flatIndexMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: indexMetadata,
      flatEntityMaps: flatIndexMetadataMaps,
    });
  }

  return flatIndexMetadataMaps;
};
