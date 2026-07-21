import { type EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

import {
  type CalendarChannelSyncStage,
  type MessageChannelSyncStage,
} from 'twenty-shared/types';

import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

// The sync crons scan every active workspace's channels, so triggering them from
// a test fans out across co-located suites. The per-channel triggers instead
// drive a SINGLE channel through its leaf job: this sets the stage the leaf job
// guards on and returns the workspaceId the job payload needs.
export const scheduleChannelStage = async (
  channelEntity: EntityClassOrSchema,
  channelId: string,
  scheduledStage: MessageChannelSyncStage | CalendarChannelSyncStage,
): Promise<string> => {
  const repository = getCoreRepository<{
    id: string;
    workspaceId: string;
    syncStage: MessageChannelSyncStage | CalendarChannelSyncStage;
  }>(channelEntity);
  const channel = await repository.findOneByOrFail({ id: channelId });

  await repository.update({ id: channelId }, { syncStage: scheduledStage });

  return channel.workspaceId;
};
