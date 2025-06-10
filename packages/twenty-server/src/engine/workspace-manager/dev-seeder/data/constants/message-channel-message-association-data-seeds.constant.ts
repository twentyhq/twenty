import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';
import { MESSAGE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-data-seeds.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';

type MessageChannelMessageAssociationDataSeed = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  messageThreadExternalId: string | null;
  messageExternalId: string | null;
  messageId: string;
  messageChannelId: string;
  direction: MessageDirection;
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_COLUMNS: (keyof MessageChannelMessageAssociationDataSeed)[] =
  [
    'id',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'messageThreadExternalId',
    'messageExternalId',
    'messageId',
    'messageChannelId',
    'direction',
  ];

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS = {
  ID_1: '20202020-cc69-44ef-a82c-600c0dbf39ba',
  ID_2: '20202020-d80e-4a13-b10b-72ba09082668',
  ID_3: '20202020-e6ec-4c8a-b431-0901eaf395a9',
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEEDS: MessageChannelMessageAssociationDataSeed[] =
  [
    {
      id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS.ID_1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      messageThreadExternalId: null,
      messageExternalId: null,
      messageId: MESSAGE_DATA_SEED_IDS.ID_1,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
      direction: MessageDirection.OUTGOING,
    },
    {
      id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS.ID_2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      messageThreadExternalId: null,
      messageExternalId: null,
      messageId: MESSAGE_DATA_SEED_IDS.ID_2,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
      direction: MessageDirection.OUTGOING,
    },
    {
      id: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_DATA_SEED_IDS.ID_3,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      messageThreadExternalId: null,
      messageExternalId: null,
      messageId: MESSAGE_DATA_SEED_IDS.ID_3,
      messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.TIM,
      direction: MessageDirection.INCOMING,
    },
  ];
