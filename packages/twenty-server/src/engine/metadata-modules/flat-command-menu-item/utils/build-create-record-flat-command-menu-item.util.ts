import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const CREATE_RECORD_COMMAND_UUID_NAMESPACE =
  '02959e3f-c244-4f89-9127-f6335cfc0f57';

export const CREATE_RECORD_INTERPOLATED_LABEL =
  'Create ${createObjectMetadataItem.labelSingular}';
export const CREATE_RECORD_INTERPOLATED_SHORT_LABEL =
  'Create ${createObjectMetadataItem.labelSingular}';
export const CREATE_RECORD_INTERPOLATED_ICON =
  '${createObjectMetadataItem.icon}';

export const buildCreateRecordFlatCommandMenuItem = ({
  objectMetadata,
  commandMenuItemId,
  applicationId,
  workspaceId,
  position,
  now,
}: {
  objectMetadata: {
    id: string;
    universalIdentifier: string;
    nameSingular: string;
  };
  commandMenuItemId: string;
  applicationId: string;
  workspaceId: string;
  position: number;
  now: string;
}): FlatCommandMenuItem => {
  const universalIdentifier = v5(
    objectMetadata.universalIdentifier,
    CREATE_RECORD_COMMAND_UUID_NAMESPACE,
  );

  return {
    id: commandMenuItemId,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    label: CREATE_RECORD_INTERPOLATED_LABEL,
    shortLabel: CREATE_RECORD_INTERPOLATED_SHORT_LABEL,
    icon: CREATE_RECORD_INTERPOLATED_ICON,
    position,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression: `targetObjectWritePermissions.${objectMetadata.nameSingular} and not (pageType == "INDEX_PAGE" and objectMetadataItem.nameSingular == "${objectMetadata.nameSingular}")`,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
    payload: { objectMetadataItemId: objectMetadata.id },
    hotKeys: null,
    workflowVersionId: null,
    availabilityObjectMetadataId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
