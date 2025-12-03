import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { buildCalendarChannelEventAssociationStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-channel-event-association-standard-flat-field-metadata.util';
import { buildCalendarChannelStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-channel-standard-flat-field-metadata.util';
import { buildCalendarEventParticipantStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-event-participant-standard-flat-field-metadata.util';
import { buildCalendarEventStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-calendar-event-standard-flat-field-metadata.util';
import { buildConnectedAccountStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-connected-account-standard-flat-field-metadata.util';
import { buildMessageChannelStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-channel-standard-flat-field-metadata.util';
import { buildMessageFolderStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-folder-standard-flat-field-metadata.util';
import { buildMessageParticipantStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-message-participant-standard-flat-field-metadata.util';
import { buildPersonStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-person-standard-flat-field-metadata.util';
import { buildWorkflowAutomatedTriggerStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-automated-trigger-standard-flat-field-metadata.util';
import { buildWorkflowVersionStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workflow-version-standard-flat-field-metadata.util';
import { buildWorkspaceMemberStandardFlatFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/compute-workspace-member-standard-flat-field-metadata.util';
import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-field-metadata-id-by-object-and-field-name.util';

type BuildStandardFlatFieldMetadataMapsArgs = {
  createdAt: Date;
  workspaceId: string;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

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
  const allFieldMetadatas: FlatFieldMetadata[] = [
    ...Object.values(buildCalendarChannelEventAssociationStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildCalendarChannelStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildCalendarEventParticipantStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildCalendarEventStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildConnectedAccountStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildMessageChannelStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildMessageFolderStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildMessageParticipantStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildPersonStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildWorkflowAutomatedTriggerStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildWorkflowVersionStandardFlatFieldMetadatas(builderArgs)),
    ...Object.values(buildWorkspaceMemberStandardFlatFieldMetadatas(builderArgs)),
  ];

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

