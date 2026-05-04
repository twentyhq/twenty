import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationOAuthProviderExceptionCode } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider-exception-code.enum';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatConnectionProviderValidatorService {
  public validateFlatConnectionProviderCreation({
    flatEntityToValidate: flatConnectionProvider,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatConnectionProviderMaps: optimisticFlatConnectionProviderMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.connectionProvider
  >): FailedFlatEntityValidation<'connectionProvider', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatConnectionProvider.universalIdentifier,
        name: flatConnectionProvider.name,
      },
      metadataName: 'connectionProvider',
      type: 'create',
    });

    if (!isNonEmptyString(flatConnectionProvider.name)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider name is required`,
        userFriendlyMessage: msg`Connection provider name is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.displayName)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider displayName is required`,
        userFriendlyMessage: msg`Connection provider display name is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.authorizationEndpoint)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider authorizationEndpoint is required`,
        userFriendlyMessage: msg`OAuth authorizationEndpoint is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.tokenEndpoint)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider tokenEndpoint is required`,
        userFriendlyMessage: msg`OAuth tokenEndpoint is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.clientIdVariable)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider clientIdVariable is required`,
        userFriendlyMessage: msg`OAuth clientIdVariable is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.clientSecretVariable)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider clientSecretVariable is required`,
        userFriendlyMessage: msg`OAuth clientSecretVariable is required`,
      });
    }

    // (name, applicationId) is unique on the table — guard at validation
    // time so the dev sees a friendly error instead of a Postgres unique-
    // violation. The optimistic map is already filtered to this workspace,
    // and within a workspace each application gets its own row, so checking
    // by (name, applicationUniversalIdentifier) is equivalent.
    const existingByName = Object.values(
      optimisticFlatConnectionProviderMaps.byUniversalIdentifier,
    ).find(
      (existing) =>
        isDefined(existing) &&
        existing.name === flatConnectionProvider.name &&
        existing.applicationUniversalIdentifier ===
          flatConnectionProvider.applicationUniversalIdentifier &&
        existing.universalIdentifier !==
          flatConnectionProvider.universalIdentifier,
    );

    if (isDefined(existingByName)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS,
        message: t`Connection provider with name ${flatConnectionProvider.name} already exists for this application`,
        userFriendlyMessage: msg`A connection provider with this name already exists for this application`,
      });
    }

    return validationResult;
  }

  public validateFlatConnectionProviderDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatConnectionProviderMaps: optimisticFlatConnectionProviderMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.connectionProvider
  >): FailedFlatEntityValidation<'connectionProvider', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'connectionProvider',
      type: 'delete',
    });

    const existingConnectionProvider = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatConnectionProviderMaps,
    });

    if (!isDefined(existingConnectionProvider)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
        message: t`Connection provider not found`,
        userFriendlyMessage: msg`Connection provider not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatConnectionProviderUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatConnectionProviderMaps: optimisticFlatConnectionProviderMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.connectionProvider
  >): FailedFlatEntityValidation<'connectionProvider', 'update'> {
    const fromFlatConnectionProvider = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatConnectionProviderMaps,
    });

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'connectionProvider',
      type: 'update',
    });

    if (!isDefined(fromFlatConnectionProvider)) {
      validationResult.errors.push({
        code: ApplicationOAuthProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
        message: t`Connection provider not found`,
        userFriendlyMessage: msg`Connection provider not found`,
      });

      return validationResult;
    }

    return validationResult;
  }
}
