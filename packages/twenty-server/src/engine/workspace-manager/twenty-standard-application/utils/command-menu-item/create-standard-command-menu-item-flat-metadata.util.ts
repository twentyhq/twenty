import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardCommandMenuItemFlatMetadata = ({
  commandMenuItemName,
  commandMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatObjectMetadataMaps },
  now,
}: {
  commandMenuItemName: keyof typeof STANDARD_COMMAND_MENU_ITEMS;
  commandMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  };
  now: string;
}): FlatCommandMenuItem => {
  const definition = STANDARD_COMMAND_MENU_ITEMS[commandMenuItemName];

  let resolvedObjectMetadataId: string | null = null;
  let resolvedObjectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(definition.availabilityObjectMetadataUniversalIdentifier)) {
    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier:
        definition.availabilityObjectMetadataUniversalIdentifier,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new Error(
        `Object metadata not found for universal identifier ${definition.availabilityObjectMetadataUniversalIdentifier}`,
      );
    }

    resolvedObjectMetadataId = flatObjectMetadata.id;
    resolvedObjectMetadataUniversalIdentifier =
      flatObjectMetadata.universalIdentifier;
  }

  return {
    id: commandMenuItemId,
    universalIdentifier: definition.universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    label: definition.label,
    shortLabel: definition.shortLabel,
    icon: definition.icon,
    position: definition.position,
    isPinned: definition.isPinned,
    availabilityType: definition.availabilityType,
    conditionalAvailabilityExpression:
      definition.conditionalAvailabilityExpression ?? null,
    frontComponentId: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: definition.engineComponentKey,
    payload:
      'payload' in definition && isDefined(definition.payload)
        ? { ...definition.payload }
        : null,
    hotKeys: definition.hotKeys ? [...definition.hotKeys] : null,
    workflowVersionId: null,
    availabilityObjectMetadataId: resolvedObjectMetadataId,
    availabilityObjectMetadataUniversalIdentifier:
      resolvedObjectMetadataUniversalIdentifier,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
