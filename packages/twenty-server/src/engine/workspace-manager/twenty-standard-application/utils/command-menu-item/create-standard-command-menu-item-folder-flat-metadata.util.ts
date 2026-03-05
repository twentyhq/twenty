import { isDefined } from 'twenty-shared/utils';

import { type CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const createStandardCommandMenuItemFolderFlatMetadata = ({
  universalIdentifier,
  label,
  shortLabel,
  icon,
  position,
  isPinned,
  availabilityType,
  frontComponentUniversalIdentifier,
  availabilityObjectMetadataUniversalIdentifier,
  commandMenuItemId,
  workspaceId,
  twentyStandardApplicationId,
  dependencyFlatEntityMaps: { flatFrontComponentMaps, flatObjectMetadataMaps },
  now,
}: {
  universalIdentifier: string;
  label: string;
  shortLabel: string | null;
  icon: string;
  position: number;
  isPinned: boolean;
  availabilityType: CommandMenuItemAvailabilityType;
  frontComponentUniversalIdentifier: string;
  availabilityObjectMetadataUniversalIdentifier: string | null;
  commandMenuItemId: string;
  workspaceId: string;
  twentyStandardApplicationId: string;
  dependencyFlatEntityMaps: {
    flatFrontComponentMaps: FlatEntityMaps<FlatFrontComponent>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  };
  now: string;
}): FlatCommandMenuItem => {
  const flatFrontComponent = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFrontComponentMaps,
    universalIdentifier: frontComponentUniversalIdentifier,
  });

  if (!isDefined(flatFrontComponent)) {
    throw new Error(
      `Front component not found for universal identifier ${frontComponentUniversalIdentifier}`,
    );
  }

  let resolvedObjectMetadataId: string | null = null;
  let resolvedObjectMetadataUniversalIdentifier: string | null = null;

  if (isDefined(availabilityObjectMetadataUniversalIdentifier)) {
    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: availabilityObjectMetadataUniversalIdentifier,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new Error(
        `Object metadata not found for universal identifier ${availabilityObjectMetadataUniversalIdentifier}`,
      );
    }

    resolvedObjectMetadataId = flatObjectMetadata.id;
    resolvedObjectMetadataUniversalIdentifier =
      flatObjectMetadata.universalIdentifier;
  }

  return {
    id: commandMenuItemId,
    universalIdentifier,
    applicationId: twentyStandardApplicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    label,
    shortLabel,
    icon,
    position,
    isPinned,
    availabilityType,
    conditionalAvailabilityExpression: null,
    frontComponentId: flatFrontComponent.id,
    frontComponentUniversalIdentifier: flatFrontComponent.universalIdentifier,
    workflowVersionId: null,
    availabilityObjectMetadataId: resolvedObjectMetadataId,
    availabilityObjectMetadataUniversalIdentifier:
      resolvedObjectMetadataUniversalIdentifier,
    createdAt: now,
    updatedAt: now,
  };
};
