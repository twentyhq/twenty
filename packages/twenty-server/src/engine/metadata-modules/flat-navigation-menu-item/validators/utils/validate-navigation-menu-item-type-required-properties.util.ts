import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined, isValidUrl, isValidUuid } from 'twenty-shared/utils';

import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type NavigationMenuItemValidationError =
  FlatEntityValidationError<NavigationMenuItemExceptionCode>;

const buildInvalidInputError = (
  message: string,
  userFriendlyMessage: MessageDescriptor,
): NavigationMenuItemValidationError => ({
  code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
  message,
  userFriendlyMessage,
});

const validateUuidProperty = ({
  value,
  message,
  userFriendlyMessage,
}: {
  value: string | null | undefined;
  message: string;
  userFriendlyMessage: MessageDescriptor;
}): NavigationMenuItemValidationError[] =>
  isDefined(value) && isValidUuid(value)
    ? []
    : [buildInvalidInputError(message, userFriendlyMessage)];

export const validateNavigationMenuItemTypeRequiredProperties = ({
  flatNavigationMenuItem,
}: {
  flatNavigationMenuItem: UniversalFlatNavigationMenuItem;
}): NavigationMenuItemValidationError[] => {
  const {
    type,
    name,
    link,
    targetRecordId,
    targetObjectMetadataUniversalIdentifier,
    viewUniversalIdentifier,
    pageLayoutUniversalIdentifier,
  } = flatNavigationMenuItem;

  if (!isDefined(type)) {
    return [
      buildInvalidInputError(
        t`Navigation menu item type is required`,
        msg`Navigation menu item type is required`,
      ),
    ];
  }

  switch (type) {
    case NavigationMenuItemType.FOLDER: {
      return isDefined(name) && name.trim() !== ''
        ? []
        : [
            buildInvalidInputError(
              t`A name is required for FOLDER type`,
              msg`A name is required for FOLDER type`,
            ),
          ];
    }
    case NavigationMenuItemType.OBJECT: {
      return validateUuidProperty({
        value: targetObjectMetadataUniversalIdentifier,
        message: t`A valid targetObjectMetadataUniversalIdentifier is required for OBJECT type`,
        userFriendlyMessage: msg`A valid targetObjectMetadataUniversalIdentifier is required for OBJECT type`,
      });
    }
    case NavigationMenuItemType.VIEW: {
      return validateUuidProperty({
        value: viewUniversalIdentifier,
        message: t`A valid viewUniversalIdentifier is required for VIEW type`,
        userFriendlyMessage: msg`A valid viewUniversalIdentifier is required for VIEW type`,
      });
    }
    case NavigationMenuItemType.RECORD: {
      return [
        ...validateUuidProperty({
          value: targetRecordId,
          message: t`A valid targetRecordId is required for RECORD type`,
          userFriendlyMessage: msg`A valid targetRecordId is required for RECORD type`,
        }),
        ...validateUuidProperty({
          value: targetObjectMetadataUniversalIdentifier,
          message: t`A valid targetObjectMetadataUniversalIdentifier is required for RECORD type`,
          userFriendlyMessage: msg`A valid targetObjectMetadataUniversalIdentifier is required for RECORD type`,
        }),
      ];
    }
    case NavigationMenuItemType.LINK: {
      return isDefined(link) && isValidUrl(link)
        ? []
        : [
            buildInvalidInputError(
              t`A valid link is required for LINK type`,
              msg`A valid link is required for LINK type`,
            ),
          ];
    }
    case NavigationMenuItemType.PAGE_LAYOUT: {
      return validateUuidProperty({
        value: pageLayoutUniversalIdentifier,
        message: t`A valid pageLayoutUniversalIdentifier is required for PAGE_LAYOUT type`,
        userFriendlyMessage: msg`A valid pageLayoutUniversalIdentifier is required for PAGE_LAYOUT type`,
      });
    }
    default: {
      // Manifests reach this validator as raw JSON, so an unknown type must be
      // reported as a validation error rather than thrown as an internal error
      const unknownType: never = type;

      return [
        buildInvalidInputError(
          t`Unknown navigation menu item type ${unknownType}`,
          msg`Unknown navigation menu item type ${unknownType}`,
        ),
      ];
    }
  }
};
