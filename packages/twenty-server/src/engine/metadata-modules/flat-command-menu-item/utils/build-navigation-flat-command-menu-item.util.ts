import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const NAVIGATION_COMMAND_UUID_NAMESPACE =
  'b31830da-2ae0-48eb-a915-12fa4ab96dd3';

export const buildNavigationFlatCommandMenuItem = ({
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
    labelPlural: string;
    icon: string | null;
    nameSingular: string;
    shortcut: string | null;
  };
  commandMenuItemId: string;
  applicationId: string;
  workspaceId: string;
  position: number;
  now: string;
}): FlatCommandMenuItem => {
  const universalIdentifier = v5(
    objectMetadata.universalIdentifier,
    NAVIGATION_COMMAND_UUID_NAMESPACE,
  );

  return {
    id: commandMenuItemId,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    label: `Go to ${objectMetadata.labelPlural}`,
    shortLabel: objectMetadata.labelPlural,
    icon: objectMetadata.icon,
    position,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression: `targetObjectReadPermissions.${objectMetadata.nameSingular}`,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: { objectMetadataItemId: objectMetadata.id },
    hotKeys: isDefined(objectMetadata.shortcut)
      ? ['G', objectMetadata.shortcut]
      : null,
    workflowVersionId: null,
    availabilityObjectMetadataId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
