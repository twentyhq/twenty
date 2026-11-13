import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ViewTabType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ViewTabExceptionCode } from 'src/engine/metadata-modules/view-tab/exceptions/view-tab.exception';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type ViewTabTypeFields = Pick<
  UniversalFlatViewTab,
  'universalIdentifier' | 'type' | 'fieldValue' | 'name'
>;

const VIEW_TAB_TYPES_UNIQUE_PER_VIEW: ViewTabType[] = [
  ViewTabType.NO_VALUE,
  ViewTabType.ALL,
];

const isSameTabSlot = (
  candidate: ViewTabTypeFields,
  viewTab: ViewTabTypeFields,
) => {
  if (candidate.type !== viewTab.type) {
    return false;
  }

  if (viewTab.type === ViewTabType.FIELD_VALUE) {
    return candidate.fieldValue === viewTab.fieldValue;
  }

  return VIEW_TAB_TYPES_UNIQUE_PER_VIEW.includes(viewTab.type);
};

export const getFlatViewTabTypeErrors = ({
  viewTab,
  flatView,
  flatViewTabMaps,
}: {
  viewTab: ViewTabTypeFields;
  flatView: Pick<
    MetadataUniversalFlatEntity<'view'>,
    'viewTabUniversalIdentifiers'
  >;
  flatViewTabMaps: MetadataUniversalFlatEntityMaps<'viewTab'>;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  switch (viewTab.type) {
    case ViewTabType.FIELD_VALUE: {
      if (!isNonEmptyString(viewTab.fieldValue)) {
        errors.push({
          code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
          message: t`Field value is required for a field value tab`,
          userFriendlyMessage: msg`Field value is required for a field value tab`,
        });
      }

      if (isDefined(viewTab.name)) {
        errors.push({
          code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
          message: t`A field value tab cannot have a name`,
          userFriendlyMessage: msg`A field value tab cannot have a name`,
        });
      }
      break;
    }
    case ViewTabType.NO_VALUE:
    case ViewTabType.ALL: {
      if (isDefined(viewTab.fieldValue) || isDefined(viewTab.name)) {
        errors.push({
          code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
          message: t`This tab type cannot have a field value or a name`,
          userFriendlyMessage: msg`This tab type cannot have a field value or a name`,
        });
      }
      break;
    }
    case ViewTabType.CUSTOM: {
      if (!isNonEmptyString(viewTab.name)) {
        errors.push({
          code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
          message: t`Name is required for a custom tab`,
          userFriendlyMessage: msg`Name is required for a custom tab`,
        });
      }

      if (isDefined(viewTab.fieldValue)) {
        errors.push({
          code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
          message: t`A custom tab cannot have a field value`,
          userFriendlyMessage: msg`A custom tab cannot have a field value`,
        });
      }
      break;
    }
    default: {
      errors.push({
        code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
        message: t`Invalid view tab type`,
        userFriendlyMessage: msg`Invalid view tab type`,
      });

      return errors;
    }
  }

  const hasDuplicateSibling = flatView.viewTabUniversalIdentifiers.some(
    (siblingUniversalIdentifier) => {
      if (siblingUniversalIdentifier === viewTab.universalIdentifier) {
        return false;
      }

      const sibling = findFlatEntityByUniversalIdentifier({
        universalIdentifier: siblingUniversalIdentifier,
        flatEntityMaps: flatViewTabMaps,
      });

      return (
        isDefined(sibling) &&
        !isDefined(sibling.deletedAt) &&
        isSameTabSlot(sibling, viewTab)
      );
    },
  );

  if (hasDuplicateSibling) {
    errors.push({
      code: ViewTabExceptionCode.INVALID_VIEW_TAB_DATA,
      message: t`This view already has a tab for this value`,
      userFriendlyMessage: msg`This view already has a tab for this value`,
    });
  }

  return errors;
};
