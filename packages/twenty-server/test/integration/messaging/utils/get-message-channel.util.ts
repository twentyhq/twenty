import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

export const getMessageChannel = (channelId: string) =>
  getCoreRepository(MessageChannelEntity).findOneByOrFail({ id: channelId });
