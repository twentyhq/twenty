import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuItemExceptionCode } from 'src/engine/metadata-modules/command-menu-item/command-menu-item.exception';
import { resolveEffectiveUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity.util';
import { type UniversalFlatCommandMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-command-menu-item.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

type ValidateCommandMenuItemPinLockArgs = {
  fromFlatCommandMenuItem?: UniversalFlatCommandMenuItem;
  toFlatCommandMenuItem: UniversalFlatCommandMenuItem;
  buildOptions: Pick<
    WorkspaceMigrationBuilderOptions,
    'applicationUniversalIdentifier'
  >;
};

const getPinLockValidationError = (): FlatEntityValidationError => ({
  code: CommandMenuItemExceptionCode.INVALID_COMMAND_MENU_ITEM_INPUT,
  message: t`This command is always pinned`,
  userFriendlyMessage: msg`This command is always pinned`,
});

const PIN_LOCKED_SCOPE_PROPERTIES = [
  'engineComponentKey',
  'availabilityType',
  'availabilityObjectMetadataUniversalIdentifier',
  'pageLayoutUniversalIdentifier',
] as const satisfies (keyof UniversalFlatCommandMenuItem)[];

export const validateCommandMenuItemPinLock = ({
  fromFlatCommandMenuItem,
  toFlatCommandMenuItem,
  buildOptions,
}: ValidateCommandMenuItemPinLockArgs):
  | FlatEntityValidationError
  | undefined => {
  if (!isDefined(fromFlatCommandMenuItem)) {
    return toFlatCommandMenuItem.isPinLocked && !toFlatCommandMenuItem.isPinned
      ? getPinLockValidationError()
      : undefined;
  }

  if (
    !fromFlatCommandMenuItem.isPinLocked ||
    buildOptions.applicationUniversalIdentifier ===
      fromFlatCommandMenuItem.applicationUniversalIdentifier
  ) {
    return undefined;
  }

  const effectiveFromFlatCommandMenuItem = resolveEffectiveUniversalFlatEntity({
    metadataName: 'commandMenuItem',
    universalFlatEntity: fromFlatCommandMenuItem,
  });

  if (
    !effectiveFromFlatCommandMenuItem.isPinned ||
    !effectiveFromFlatCommandMenuItem.isActive
  ) {
    return undefined;
  }

  const effectiveToFlatCommandMenuItem = resolveEffectiveUniversalFlatEntity({
    metadataName: 'commandMenuItem',
    universalFlatEntity: toFlatCommandMenuItem,
  });

  const isMovedOutOfScope = PIN_LOCKED_SCOPE_PROPERTIES.some(
    (property) =>
      effectiveToFlatCommandMenuItem[property] !==
        effectiveFromFlatCommandMenuItem[property] &&
      effectiveToFlatCommandMenuItem[property] !==
        toFlatCommandMenuItem[property],
  );

  return !effectiveToFlatCommandMenuItem.isPinned ||
    !effectiveToFlatCommandMenuItem.isActive ||
    isMovedOutOfScope
    ? getPinLockValidationError()
    : undefined;
};
