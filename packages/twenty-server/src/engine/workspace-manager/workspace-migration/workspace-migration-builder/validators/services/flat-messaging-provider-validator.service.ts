import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { MessagingProviderExceptionCode } from 'src/engine/metadata-modules/messaging-provider/messaging-provider.exception';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatMessagingProvider } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-messaging-provider.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

const isInApplication = <TFlatEntity extends UniversalSyncableFlatEntity>({
  flatEntityMaps,
  universalIdentifier,
  applicationUniversalIdentifier,
}: {
  flatEntityMaps: UniversalFlatEntityMaps<TFlatEntity>;
  universalIdentifier: string;
  applicationUniversalIdentifier: string;
}): boolean =>
  findFlatEntityByUniversalIdentifier({ flatEntityMaps, universalIdentifier })
    ?.applicationUniversalIdentifier === applicationUniversalIdentifier;

const validateMessagingProviderReferences = ({
  flatMessagingProvider,
  flatConnectionProviderMaps,
  flatLogicFunctionMaps,
}: {
  flatMessagingProvider: Pick<
    UniversalFlatMessagingProvider,
    | 'applicationUniversalIdentifier'
    | 'connectionProviderUniversalIdentifier'
    | 'sendMessageLogicFunctionUniversalIdentifier'
  >;
  flatConnectionProviderMaps: MetadataUniversalFlatEntityMaps<'connectionProvider'>;
  flatLogicFunctionMaps: MetadataUniversalFlatEntityMaps<'logicFunction'>;
}): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  if (
    !isInApplication({
      flatEntityMaps: flatConnectionProviderMaps,
      universalIdentifier:
        flatMessagingProvider.connectionProviderUniversalIdentifier,
      applicationUniversalIdentifier:
        flatMessagingProvider.applicationUniversalIdentifier,
    })
  ) {
    errors.push({
      code: MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT,
      message: t`Connection provider "${flatMessagingProvider.connectionProviderUniversalIdentifier}" was not found in this application`,
      userFriendlyMessage: msg`The connection provider this messaging provider uses was not found in its application.`,
    });
  }

  const sendMessageLogicFunctionUniversalIdentifier =
    flatMessagingProvider.sendMessageLogicFunctionUniversalIdentifier;

  if (
    isDefined(sendMessageLogicFunctionUniversalIdentifier) &&
    !isInApplication({
      flatEntityMaps: flatLogicFunctionMaps,
      universalIdentifier: sendMessageLogicFunctionUniversalIdentifier,
      applicationUniversalIdentifier:
        flatMessagingProvider.applicationUniversalIdentifier,
    })
  ) {
    errors.push({
      code: MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT,
      message: t`Send message logic function "${sendMessageLogicFunctionUniversalIdentifier}" was not found in this application`,
      userFriendlyMessage: msg`The logic function this messaging provider sends with was not found in its application.`,
    });
  }

  return errors;
};

const findOtherMessagingProviderWithName = ({
  flatMessagingProviderMaps,
  name,
  applicationUniversalIdentifier,
  universalIdentifier,
}: {
  flatMessagingProviderMaps: Pick<
    MetadataUniversalFlatEntityMaps<'messagingProvider'>,
    'byUniversalIdentifier'
  >;
  name: string;
  applicationUniversalIdentifier: string;
  universalIdentifier: string;
}) =>
  Object.values(flatMessagingProviderMaps.byUniversalIdentifier).find(
    (existing) =>
      isDefined(existing) &&
      existing.name === name &&
      existing.applicationUniversalIdentifier ===
        applicationUniversalIdentifier &&
      existing.universalIdentifier !== universalIdentifier,
  );

const getNameAlreadyExistsError = (
  name: string,
): FlatEntityValidationError => ({
  code: MessagingProviderExceptionCode.MESSAGING_PROVIDER_NAME_ALREADY_EXISTS,
  message: t`Messaging provider with name ${name} already exists for this application`,
  userFriendlyMessage: msg`A messaging provider with this name already exists for this application`,
});

@Injectable()
export class FlatMessagingProviderValidatorService {
  public validateFlatMessagingProviderCreation({
    flatEntityToValidate: flatMessagingProvider,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMessagingProviderMaps: optimisticFlatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.messagingProvider
  >): FailedFlatEntityValidation<'messagingProvider', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatMessagingProvider.universalIdentifier,
        name: flatMessagingProvider.name,
      },
      metadataName: 'messagingProvider',
      type: 'create',
    });

    if (!isNonEmptyString(flatMessagingProvider.name)) {
      validationResult.errors.push({
        code: MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT,
        message: t`Messaging provider name is required`,
        userFriendlyMessage: msg`Messaging provider name is required`,
      });
    }

    if (!isNonEmptyString(flatMessagingProvider.displayName)) {
      validationResult.errors.push({
        code: MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT,
        message: t`Messaging provider displayName is required`,
        userFriendlyMessage: msg`Messaging provider display name is required`,
      });
    }

    validationResult.errors.push(
      ...validateMessagingProviderReferences({
        flatMessagingProvider,
        flatConnectionProviderMaps,
        flatLogicFunctionMaps,
      }),
    );

    if (
      isDefined(
        findOtherMessagingProviderWithName({
          flatMessagingProviderMaps: optimisticFlatMessagingProviderMaps,
          name: flatMessagingProvider.name,
          applicationUniversalIdentifier:
            flatMessagingProvider.applicationUniversalIdentifier,
          universalIdentifier: flatMessagingProvider.universalIdentifier,
        }),
      )
    ) {
      validationResult.errors.push(
        getNameAlreadyExistsError(flatMessagingProvider.name),
      );
    }

    return validationResult;
  }

  public validateFlatMessagingProviderDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMessagingProviderMaps: optimisticFlatMessagingProviderMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.messagingProvider
  >): FailedFlatEntityValidation<'messagingProvider', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'messagingProvider',
      type: 'delete',
    });

    const existingMessagingProvider = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatMessagingProviderMaps,
    });

    if (!isDefined(existingMessagingProvider)) {
      validationResult.errors.push({
        code: MessagingProviderExceptionCode.MESSAGING_PROVIDER_NOT_FOUND,
        message: t`Messaging provider not found`,
        userFriendlyMessage: msg`Messaging provider not found`,
      });
    }

    return validationResult;
  }

  public validateFlatMessagingProviderUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatMessagingProviderMaps: optimisticFlatMessagingProviderMaps,
      flatConnectionProviderMaps,
      flatLogicFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.messagingProvider
  >): FailedFlatEntityValidation<'messagingProvider', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'messagingProvider',
      type: 'update',
    });

    const fromFlatMessagingProvider = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticFlatMessagingProviderMaps,
    });

    if (!isDefined(fromFlatMessagingProvider)) {
      validationResult.errors.push({
        code: MessagingProviderExceptionCode.MESSAGING_PROVIDER_NOT_FOUND,
        message: t`Messaging provider not found`,
        userFriendlyMessage: msg`Messaging provider not found`,
      });

      return validationResult;
    }

    if (
      isDefined(flatEntityUpdate.name) &&
      flatEntityUpdate.name !== fromFlatMessagingProvider.name &&
      isDefined(
        findOtherMessagingProviderWithName({
          flatMessagingProviderMaps: optimisticFlatMessagingProviderMaps,
          name: flatEntityUpdate.name,
          applicationUniversalIdentifier:
            fromFlatMessagingProvider.applicationUniversalIdentifier,
          universalIdentifier,
        }),
      )
    ) {
      validationResult.errors.push(
        getNameAlreadyExistsError(flatEntityUpdate.name),
      );
    }

    if (
      isDefined(flatEntityUpdate.connectionProviderUniversalIdentifier) &&
      flatEntityUpdate.connectionProviderUniversalIdentifier !==
        fromFlatMessagingProvider.connectionProviderUniversalIdentifier
    ) {
      validationResult.errors.push({
        code: MessagingProviderExceptionCode.INVALID_MESSAGING_PROVIDER_INPUT,
        message: t`Messaging provider connection provider cannot be changed after creation: declare a new messaging provider with a new universalIdentifier`,
        userFriendlyMessage: msg`Messaging provider connection provider cannot be changed`,
      });
    }

    validationResult.errors.push(
      ...validateMessagingProviderReferences({
        flatMessagingProvider: {
          ...fromFlatMessagingProvider,
          ...flatEntityUpdate,
        },
        flatConnectionProviderMaps,
        flatLogicFunctionMaps,
      }),
    );

    return validationResult;
  }
}
