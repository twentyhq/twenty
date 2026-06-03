import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

export const NAVIGATION_COMMAND_UUID_NAMESPACE =
  'b31830da-2ae0-48eb-a915-12fa4ab96dd3';

export const NAVIGATION_INTERPOLATED_LABEL =
  'Go to ${navigateToObjectMetadataItem.labelPlural}';
export const NAVIGATION_INTERPOLATED_SHORT_LABEL =
  '${navigateToObjectMetadataItem.labelPlural}';
export const NAVIGATION_INTERPOLATED_ICON =
  '${navigateToObjectMetadataItem.icon}';

const NAVIGATION_FEATURE_FLAG_GATE_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, FeatureFlagKey>
> = {
  [STANDARD_OBJECTS.callRecording.universalIdentifier]:
    FeatureFlagKey.IS_CALL_RECORDING_ENABLED,
};

export const buildNavigationConditionalAvailabilityExpression = ({
  universalIdentifier,
  nameSingular,
}: {
  universalIdentifier: string;
  nameSingular: string;
}): string => {
  const targetObjectReadPermissionExpression = `targetObjectReadPermissions.${nameSingular}`;
  const featureFlagGate =
    NAVIGATION_FEATURE_FLAG_GATE_BY_OBJECT_UNIVERSAL_IDENTIFIER[
      universalIdentifier
    ];

  return isDefined(featureFlagGate)
    ? `featureFlags.${featureFlagGate} and ${targetObjectReadPermissionExpression}`
    : targetObjectReadPermissionExpression;
};

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

  const conditionalAvailabilityExpression =
    buildNavigationConditionalAvailabilityExpression({
      universalIdentifier: objectMetadata.universalIdentifier,
      nameSingular: objectMetadata.nameSingular,
    });

  return {
    id: commandMenuItemId,
    universalIdentifier,
    applicationId,
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    workspaceId,
    label: NAVIGATION_INTERPOLATED_LABEL,
    shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
    icon: NAVIGATION_INTERPOLATED_ICON,
    position,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression,
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
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
