import { msg } from '@lingui/core/macro';
import { isBoolean, isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { resolveEffectiveUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity.util';
import { type OverridableUniversalFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-universal-flat-entity-property.util';
import { PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED_CODE } from 'src/engine/permissions/metadata-permissions/constants/privatable-entity-privacy-change-not-allowed-code.constant';
import { type PrivatableEntity } from 'src/engine/permissions/metadata-permissions/types/privatable-entity.type';
import { canCallerChangePrivatableEntityPrivacy } from 'src/engine/permissions/metadata-permissions/utils/can-caller-change-privatable-entity-privacy.util';
import { isPrivatableMetadataName } from 'src/engine/permissions/metadata-permissions/utils/is-privatable-metadata-name.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type PrivatableUniversalFlatEntity = OverridableUniversalFlatEntity &
  Record<string, unknown>;

const getEffectivePrivacy = ({
  metadataName,
  universalFlatEntity,
}: {
  metadataName: AllMetadataName;
  universalFlatEntity: PrivatableUniversalFlatEntity;
}): PrivatableEntity => {
  const { isPrivate, createdByUserWorkspaceId } =
    resolveEffectiveUniversalFlatEntity({ metadataName, universalFlatEntity });

  return {
    isPrivate: isBoolean(isPrivate) && isPrivate,
    createdByUserWorkspaceId: isNonEmptyString(createdByUserWorkspaceId)
      ? createdByUserWorkspaceId
      : null,
  };
};

const isAllowedPrivacy = ({
  from,
  to,
  authContext,
}: {
  from: PrivatableEntity | undefined;
  to: PrivatableEntity;
  authContext: WorkspaceAuthContext | undefined;
}): boolean => {
  if (isDefined(authContext) && isSystemAuthContext(authContext)) {
    return true;
  }

  const callerUserWorkspaceId =
    isDefined(authContext) && isUserAuthContext(authContext)
      ? authContext.userWorkspaceId
      : undefined;

  if (!isDefined(from)) {
    return (
      (!to.isPrivate && !isDefined(to.createdByUserWorkspaceId)) ||
      (isDefined(callerUserWorkspaceId) &&
        to.createdByUserWorkspaceId === callerUserWorkspaceId)
    );
  }

  const isPrivacyChanging =
    from.isPrivate !== to.isPrivate ||
    from.createdByUserWorkspaceId !== to.createdByUserWorkspaceId;

  return (
    !isPrivacyChanging ||
    (canCallerChangePrivatableEntityPrivacy({
      privatableEntity: from,
      authContext,
    }) &&
      to.createdByUserWorkspaceId === callerUserWorkspaceId)
  );
};

export const getPrivatableEntityPrivacyValidationErrors = ({
  metadataName,
  fromUniversalFlatEntity,
  toUniversalFlatEntity,
  authContext = workspaceAuthContextStorage.getStore(),
}: {
  metadataName: AllMetadataName;
  fromUniversalFlatEntity?: PrivatableUniversalFlatEntity;
  toUniversalFlatEntity: PrivatableUniversalFlatEntity;
  authContext?: WorkspaceAuthContext;
}): FlatEntityValidationError[] => {
  if (!isPrivatableMetadataName(metadataName)) {
    return [];
  }

  const from = isDefined(fromUniversalFlatEntity)
    ? getEffectivePrivacy({
        metadataName,
        universalFlatEntity: fromUniversalFlatEntity,
      })
    : undefined;
  const to = getEffectivePrivacy({
    metadataName,
    universalFlatEntity: toUniversalFlatEntity,
  });

  if (isAllowedPrivacy({ from, to, authContext })) {
    return [];
  }

  return [
    {
      code: PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED_CODE,
      message: `Only the workspace member who created this ${metadataName} can change who sees it`,
      userFriendlyMessage: msg`Only the person who created this can change who sees it`,
    },
  ];
};
