import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { validateAgentChatChannelNameUniqueness } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-agent-chat-channel-name-uniqueness.util';
import { type FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatAgentChatChannelValidatorService {
  public validateFlatAgentChatChannelCreation({
    flatEntityToValidate: flatAgentChatChannel,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelMaps,
    },
  }: FlatEntityCreationValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannel
  >): FailedFlatEntityValidation<'agentChatChannel', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatAgentChatChannel.universalIdentifier,
        name: flatAgentChatChannel.name,
      },
      metadataName: 'agentChatChannel',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.validateChannelName({
        name: flatAgentChatChannel.name,
        universalIdentifier: flatAgentChatChannel.universalIdentifier,
        flatAgentChatChannelMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatAgentChatChannelUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannel
  >): FailedFlatEntityValidation<'agentChatChannel', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: { universalIdentifier },
      metadataName: 'agentChatChannel',
      type: 'update',
    });

    const existingChannel = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: flatAgentChatChannelMaps,
    });

    if (!isDefined(existingChannel)) {
      validationResult.errors.push({
        code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
        message: t`Channel not found`,
        userFriendlyMessage: msg`Channel not found.`,
      });

      return validationResult;
    }

    if (isDefined(flatEntityUpdate.name)) {
      validationResult.errors.push(
        ...this.validateChannelName({
          name: flatEntityUpdate.name,
          universalIdentifier,
          flatAgentChatChannelMaps,
        }),
      );
    }

    return validationResult;
  }

  public validateFlatAgentChatChannelDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannel
  >): FailedFlatEntityValidation<'agentChatChannel', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
        name: flatEntityToValidate.name,
      },
      metadataName: 'agentChatChannel',
      type: 'delete',
    });

    const existingChannel = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: flatAgentChatChannelMaps,
    });

    if (!isDefined(existingChannel)) {
      validationResult.errors.push({
        code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
        message: t`Channel not found`,
        userFriendlyMessage: msg`Channel not found.`,
      });
    }

    return validationResult;
  }

  private validateChannelName({
    name,
    universalIdentifier,
    flatAgentChatChannelMaps,
  }: {
    name: string;
    universalIdentifier: string;
    flatAgentChatChannelMaps: MetadataUniversalFlatEntityMaps<'agentChatChannel'>;
  }) {
    if (!isNonEmptyString(name.trim())) {
      return [
        {
          code: AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
          message: t`Channel name is required`,
          userFriendlyMessage: msg`A channel needs a name.`,
        },
      ];
    }

    return validateAgentChatChannelNameUniqueness({
      name,
      existingFlatAgentChatChannels: Object.values(
        flatAgentChatChannelMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter(
          (existingChannel) =>
            existingChannel.universalIdentifier !== universalIdentifier,
        ),
    });
  }
}
