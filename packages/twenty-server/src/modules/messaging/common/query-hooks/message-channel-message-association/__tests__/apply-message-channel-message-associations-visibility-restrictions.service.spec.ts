import { type ObjectRecord } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type CommonRecordVisibilityService } from 'src/engine/api/common/common-record-visibility/common-record-visibility.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ApplyMessageChannelMessageAssociationsVisibilityRestrictionsService } from 'src/modules/messaging/common/query-hooks/message-channel-message-association/apply-message-channel-message-associations-visibility-restrictions.service';

describe('ApplyMessageChannelMessageAssociationsVisibilityRestrictionsService', () => {
  const executeInWorkspaceContext = jest.fn();

  const service =
    new ApplyMessageChannelMessageAssociationsVisibilityRestrictionsService(
      { executeInWorkspaceContext } as unknown as WorkspaceOrmManager,
      {} as CommonRecordVisibilityService,
      { find: jest.fn() } as unknown as Repository<MessageChannelEntity>,
    );

  const authContext = {
    type: 'user',
    workspace: { id: 'workspace-1' },
    userWorkspaceId: 'user-workspace-1',
  } as unknown as WorkspaceAuthContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('masks the read state of an association selected without its id', async () => {
    const records = [{ isRead: false }] as unknown as ObjectRecord[];

    await service.applyVisibilityRestrictions({ records, authContext });

    expect(records).toEqual([{ isRead: true }]);
    expect(executeInWorkspaceContext).not.toHaveBeenCalled();
  });

  it('leaves associations without a read state untouched', async () => {
    const records = [{ id: 'association-1' }];

    await service.applyVisibilityRestrictions({ records, authContext });

    expect(records).toEqual([{ id: 'association-1' }]);
    expect(executeInWorkspaceContext).not.toHaveBeenCalled();
  });
});
