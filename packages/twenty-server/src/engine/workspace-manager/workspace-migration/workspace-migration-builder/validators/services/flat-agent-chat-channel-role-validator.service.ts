import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityCreationValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-creation-validation-args.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

@Injectable()
export class FlatAgentChatChannelRoleValidatorService {
  public validateFlatAgentChatChannelRoleCreation({
    flatEntityToValidate: flatAgentChatChannelRole,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelRoleMaps,
      flatAgentChatChannelMaps,
      flatRoleMaps,
    },
  }: FlatEntityCreationValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannelRole
  >): FailedFlatEntityValidation<'agentChatChannelRole', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatAgentChatChannelRole.universalIdentifier,
        channelUniversalIdentifier:
          flatAgentChatChannelRole.channelUniversalIdentifier,
        roleUniversalIdentifier:
          flatAgentChatChannelRole.roleUniversalIdentifier,
      },
      metadataName: 'agentChatChannelRole',
      type: 'create',
    });

    const channel = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatAgentChatChannelRole.channelUniversalIdentifier,
      flatEntityMaps: flatAgentChatChannelMaps,
    });

    if (!isDefined(channel)) {
      validationResult.errors.push({
        code: AiExceptionCode.CHAT_CHANNEL_NOT_FOUND,
        message: t`Channel not found`,
        userFriendlyMessage: msg`Channel not found.`,
      });
    }

    const role = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatAgentChatChannelRole.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(role)) {
      validationResult.errors.push({
        code: AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
        message: t`Role not found`,
        userFriendlyMessage: msg`One of these roles no longer exists.`,
      });
    }

    const isAlreadyLinked = Object.values(
      flatAgentChatChannelRoleMaps.byUniversalIdentifier,
    ).some(
      (existingChannelRole) =>
        isDefined(existingChannelRole) &&
        existingChannelRole.universalIdentifier !==
          flatAgentChatChannelRole.universalIdentifier &&
        existingChannelRole.channelUniversalIdentifier ===
          flatAgentChatChannelRole.channelUniversalIdentifier &&
        existingChannelRole.roleUniversalIdentifier ===
          flatAgentChatChannelRole.roleUniversalIdentifier,
    );

    if (isAlreadyLinked) {
      validationResult.errors.push({
        code: AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
        message: t`This role already has access to the channel`,
        userFriendlyMessage: msg`This role already has access to the channel.`,
      });
    }

    return validationResult;
  }

  public validateFlatAgentChatChannelRoleUpdate({
    universalIdentifier,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelRoleMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannelRole
  >): FailedFlatEntityValidation<'agentChatChannelRole', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: { universalIdentifier },
      metadataName: 'agentChatChannelRole',
      type: 'update',
    });

    const existingChannelRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: flatAgentChatChannelRoleMaps,
    });

    if (!isDefined(existingChannelRole)) {
      validationResult.errors.push({
        code: AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
        message: t`Channel role link not found`,
        userFriendlyMessage: msg`This channel access no longer exists.`,
      });
    }

    return validationResult;
  }

  public validateFlatAgentChatChannelRoleDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatAgentChatChannelRoleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.agentChatChannelRole
  >): FailedFlatEntityValidation<'agentChatChannelRole', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'agentChatChannelRole',
      type: 'delete',
    });

    const existingChannelRole = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: flatAgentChatChannelRoleMaps,
    });

    if (!isDefined(existingChannelRole)) {
      validationResult.errors.push({
        code: AiExceptionCode.INVALID_CHAT_CHANNEL_ROLE,
        message: t`Channel role link not found`,
        userFriendlyMessage: msg`This channel access no longer exists.`,
      });
    }

    return validationResult;
  }
}
