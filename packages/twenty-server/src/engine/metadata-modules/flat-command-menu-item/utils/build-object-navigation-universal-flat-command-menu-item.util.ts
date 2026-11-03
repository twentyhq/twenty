import { msg } from '@lingui/core/macro';
import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { getMetadataLabelPlaceholder } from 'twenty-shared/i18n';
import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { buildNavigationConditionalAvailability } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-conditional-availability.util';
import { fromConditionalDisplayToUniversalConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/from-conditional-display-to-universal-conditional-display.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
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

export const buildObjectNavigationUniversalFlatCommandMenuItem = ({
  objectMetadata,
  applicationUniversalIdentifier,
  position,
  now,
  dependencyFlatEntityMaps: { flatFieldMetadataMaps, flatRoleMaps },
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
  dependencyFlatEntityMaps: {
    flatFieldMetadataMaps: FlatFieldMetadataMaps;
    flatRoleMaps: FlatRoleMaps;
  };
}): UniversalFlatCommandMenuItem => {
  const universalIdentifier =
    getSystemNavigationCommandMenuItemUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
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
    universalConditionalDisplay: null,
    universalConditionalAvailability:
      fromConditionalDisplayToUniversalConditionalDisplay({
        conditionalDisplay: buildNavigationConditionalAvailability({
          universalIdentifier: objectMetadata.universalIdentifier,
          nameSingular: objectMetadata.nameSingular,
        }),
        fieldMetadataUniversalIdentifierById:
          flatFieldMetadataMaps.universalIdentifierById,
        roleUniversalIdentifierById: flatRoleMaps.universalIdentifierById,
      }),
    universalConditionalPinned: null,
    frontComponentUniversalIdentifier: null,
    engineComponentKey: EngineComponentKey.NAVIGATION,
    payload: null,
    navigationTargetObjectMetadataUniversalIdentifier:
      objectMetadata.universalIdentifier,
    hotKeys: isDefined(objectMetadata.shortcut)
      ? ['G', objectMetadata.shortcut]
      : null,
    workflowVersionId: null,
    coreWorkflowVersionId: null,
    availabilityObjectMetadataUniversalIdentifier: null,
    pageLayoutUniversalIdentifier: null,
    isActive: objectMetadata.isActive,
    isSystemSideEffect: true,
    universalOverrides: null,
    createdAt: now,
    updatedAt: now,
  };
};
