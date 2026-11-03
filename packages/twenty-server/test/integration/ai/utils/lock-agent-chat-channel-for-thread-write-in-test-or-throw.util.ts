import { isFunction } from '@sniptt/guards';
import { type EntityTarget, type ObjectLiteral } from 'typeorm';

import { lockAgentChatChannelForThreadWriteOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/lock-agent-chat-channel-for-thread-write-or-throw.util';

export const lockAgentChatChannelForThreadWriteInTestOrThrow = ({
  manager,
  ...args
}: Parameters<
  typeof lockAgentChatChannelForThreadWriteOrThrow
>[0]): Promise<void> =>
  lockAgentChatChannelForThreadWriteOrThrow({
    ...args,
    manager: {
      query: manager.query.bind(manager),
      getRepository: <Entity extends ObjectLiteral>(
        target: EntityTarget<Entity>,
      ) =>
        manager.getRepository<Entity>(
          isFunction(target) ? target.name : target,
        ),
    },
  });
