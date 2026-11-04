import { msg, t } from '@lingui/core/macro';

import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type UniversalFlatAgentChatChannel } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-agent-chat-channel.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateAgentChatChannelNameUniqueness = ({
  name,
  existingFlatAgentChatChannels,
}: {
  name: string;
  existingFlatAgentChatChannels: UniversalFlatAgentChatChannel[];
}): FlatEntityValidationError<AiExceptionCode>[] => {
  const errors: FlatEntityValidationError<AiExceptionCode>[] = [];

  if (existingFlatAgentChatChannels.some((channel) => channel.name === name)) {
    errors.push({
      code: AiExceptionCode.INVALID_CHAT_CHANNEL_NAME,
      message: t`A channel named "${name}" already exists`,
      userFriendlyMessage: msg`A channel with this name already exists.`,
    });
  }

  return errors;
};
