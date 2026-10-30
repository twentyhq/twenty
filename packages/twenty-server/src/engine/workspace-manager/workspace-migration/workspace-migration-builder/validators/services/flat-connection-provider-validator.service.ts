import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { validateConnectionProviderScope } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-connection-provider-scope.util';

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
        code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider name is required`,
        userFriendlyMessage: msg`Connection provider name is required`,
      });
    }

    if (!isNonEmptyString(flatConnectionProvider.displayName)) {
      validationResult.errors.push({
        code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider displayName is required`,
        userFriendlyMessage: msg`Connection provider display name is required`,
      });
    }

    validationResult.errors.push(
      ...validateConnectionProviderScope(flatConnectionProvider.scope),
    );

    if (flatConnectionProvider.type === 'oauth') {
      const oauthConfig = flatConnectionProvider.oauthConfig;

      if (!isDefined(oauthConfig)) {
        validationResult.errors.push({
          code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
          message: t`Connection provider with type 'oauth' is missing oauthConfig`,
          userFriendlyMessage: msg`OAuth connection provider is missing its oauth config block`,
        });
      } else {
        const requiredOAuthFields: Array<{
          key: keyof typeof oauthConfig;
          label: string;
        }> = [
          { key: 'authorizationEndpoint', label: 'authorizationEndpoint' },
          { key: 'tokenEndpoint', label: 'tokenEndpoint' },
          { key: 'clientIdVariable', label: 'clientIdVariable' },
          { key: 'clientSecretVariable', label: 'clientSecretVariable' },
        ];

        for (const { key, label } of requiredOAuthFields) {
          if (!isNonEmptyString(oauthConfig[key])) {
            validationResult.errors.push({
              code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
              message: t`Connection provider oauthConfig.${label} is required`,
              userFriendlyMessage: msg`OAuth ${label} is required`,
            });
          }
        }
      }
    }

    if (flatConnectionProvider.type === 'custom') {
      const customConfig = flatConnectionProvider.customConfig;

      if (
        !isDefined(customConfig) ||
        !isNonEmptyString(
          customConfig.authorizeLogicFunctionUniversalIdentifier,
        ) ||
        !isNonEmptyString(customConfig.callbackLogicFunctionUniversalIdentifier)
      ) {
        validationResult.errors.push({
          code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
          message: t`Connection provider with type 'custom' must reference an authorize and a callback logic function`,
          userFriendlyMessage: msg`Custom connection provider is missing its authorize or callback logic function`,
        });
      }
    }

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
        code: ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NAME_ALREADY_EXISTS,
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
        code: ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
        message: t`Connection provider not found`,
        userFriendlyMessage: msg`Connection provider not found`,
      });

      return validationResult;
    }

    return validationResult;
  }

  public validateFlatConnectionProviderUpdate({
    universalIdentifier,
    flatEntityUpdate,
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
        code: ConnectionProviderExceptionCode.CONNECTION_PROVIDER_NOT_FOUND,
        message: t`Connection provider not found`,
        userFriendlyMessage: msg`Connection provider not found`,
      });

      return validationResult;
    }

    if (
      isDefined(flatEntityUpdate.scope) &&
      flatEntityUpdate.scope !== fromFlatConnectionProvider.scope
    ) {
      validationResult.errors.push({
        code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider scope cannot be changed after creation: declare a new connection provider with a new universalIdentifier`,
        userFriendlyMessage: msg`Connection provider scope cannot be changed`,
      });
    }

    if (
      isDefined(flatEntityUpdate.type) &&
      flatEntityUpdate.type !== fromFlatConnectionProvider.type
    ) {
      validationResult.errors.push({
        code: ConnectionProviderExceptionCode.INVALID_CONNECTION_PROVIDER_INPUT,
        message: t`Connection provider type cannot be changed after creation: declare a new connection provider with a new universalIdentifier`,
        userFriendlyMessage: msg`Connection provider type cannot be changed`,
      });
    }

    return validationResult;
  }
}
