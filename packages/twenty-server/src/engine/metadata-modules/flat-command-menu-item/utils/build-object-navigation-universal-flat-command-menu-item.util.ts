import { msg } from '@lingui/core/macro';
import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { getMetadataLabelPlaceholder } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  CommandMenuItemAvailabilityType,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';

// The stored label is the source message; the target object's label stays a
// placeholder filled at read time for the reader's locale.
export const NAVIGATION_INTERPOLATED_LABEL = i18nLabel(
  msg({
    message: `Go to {objectLabelPlural}`,
    context: 'commandMenuItem.label',
  }),
);
export const NAVIGATION_INTERPOLATED_SHORT_LABEL =
  getMetadataLabelPlaceholder('objectLabelPlural');
export const NAVIGATION_INTERPOLATED_ICON =
  getMetadataLabelPlaceholder('objectIcon');

const NAVIGATION_FEATURE_FLAG_GATE_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, FeatureFlagKey>
> = {
  [STANDARD_OBJECTS.messageCampaign.universalIdentifier]:
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
  [STANDARD_OBJECTS.messageList.universalIdentifier]:
    FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
};

const NAVIGATION_HIDING_FEATURE_FLAG_BY_OBJECT_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, FeatureFlagKey>
> = {
  [STANDARD_OBJECTS.workflowVersion.universalIdentifier]:
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
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
  const hidingFeatureFlagGate =
    NAVIGATION_HIDING_FEATURE_FLAG_BY_OBJECT_UNIVERSAL_IDENTIFIER[
      universalIdentifier
    ];

  if (isDefined(hidingFeatureFlagGate)) {
    return `not featureFlags.${hidingFeatureFlagGate} and ${targetObjectReadPermissionExpression}`;
  }

  return isDefined(featureFlagGate)
    ? `featureFlags.${featureFlagGate} and ${targetObjectReadPermissionExpression}`
    : targetObjectReadPermissionExpression;
};

export const buildObjectNavigationUniversalFlatCommandMenuItem = ({
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
    isActive: boolean;
  };
  applicationUniversalIdentifier: string;
  position: number;
  now: string;
}): UniversalFlatCommandMenuItem => {
  const universalIdentifier =
    getSystemNavigationCommandMenuItemUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
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
    conditionalPinnedExpression: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: null,
    navigationTargetObjectMetadataUniversalIdentifier:
      objectMetadata.universalIdentifier,
    hotKeys: isDefined(objectMetadata.shortcut)
      ? ['G', objectMetadata.shortcut]
      : null,
    workflowVersionId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutUniversalIdentifier: null,
    isActive: objectMetadata.isActive,
    isSystemSideEffect: true,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};
