import { getNavigationCommandUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

export const NAVIGATION_INTERPOLATED_LABEL =
  'Go to ${navigateToObjectMetadataItem.labelPlural}';
export const NAVIGATION_INTERPOLATED_SHORT_LABEL =
  '${navigateToObjectMetadataItem.labelPlural}';
export const NAVIGATION_INTERPOLATED_ICON =
  '${navigateToObjectMetadataItem.icon}';

const NAVIGATION_FEATURE_FLAG_GATE_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, FeatureFlagKey>
> = {
  [STANDARD_OBJECTS.messageCampaign.universalIdentifier]:
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  [STANDARD_OBJECTS.messageList.universalIdentifier]:
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
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

export const buildNavigationUniversalFlatCommandMenuItem = ({
  objectMetadata,
  applicationUniversalIdentifier,
  position,
  now,
}: {
  objectMetadata: {
    id: string;
    universalIdentifier: string;
    nameSingular: string;
    shortcut: string | null;
  };
  applicationUniversalIdentifier: string;
  position: number;
  now: string;
}): UniversalFlatCommandMenuItem => {
  const universalIdentifier = getNavigationCommandUniversalIdentifier({
    applicationUniversalIdentifier,
    objectUniversalIdentifier: objectMetadata.universalIdentifier,
  });

  const conditionalAvailabilityExpression =
    buildNavigationConditionalAvailabilityExpression({
      universalIdentifier: objectMetadata.universalIdentifier,
      nameSingular: objectMetadata.nameSingular,
    });

  return {
    universalIdentifier,
    applicationUniversalIdentifier,
    label: NAVIGATION_INTERPOLATED_LABEL,
    shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
    icon: NAVIGATION_INTERPOLATED_ICON,
    position,
    isPinned: false,
    availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    conditionalAvailabilityExpression,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: { objectMetadataItemId: objectMetadata.id },
    hotKeys: isDefined(objectMetadata.shortcut)
      ? ['G', objectMetadata.shortcut]
      : null,
    workflowVersionId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutUniversalIdentifier: null,
    isActive: true,
    isSystemSideEffect: true,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};

export const buildNavigationFlatCommandMenuItem = ({
  objectMetadata,
  commandMenuItemId,
  applicationId,
  applicationUniversalIdentifier,
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
  applicationUniversalIdentifier: string;
  workspaceId: string;
  position: number;
  now: string;
}): FlatCommandMenuItem => ({
  ...buildNavigationUniversalFlatCommandMenuItem({
    objectMetadata,
    applicationUniversalIdentifier,
    position,
    now,
  }),
  id: commandMenuItemId,
  applicationId,
  workspaceId,
  frontComponentId: null,
  availabilityObjectMetadataId: null,
  pageLayoutId: null,
  overrides: null,
});
