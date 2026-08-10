import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { OnboardingEmailDigestService } from 'src/modules/onboarding-email-digest/services/onboarding-email-digest.service';

describe('OnboardingEmailDigestService', () => {
  const workspaceId = 'workspace-id';
  const userWorkspaceId = 'user-workspace-id';

  const buildService = ({
    connectedAccounts = [
      {
        id: 'connected-account-id',
        handle: 'Admin@acme.com',
        handleAliases: ['alias@acme.com'],
      },
    ],
    messageChannels = [
      {
        id: 'message-channel-id',
        syncStatus: MessageChannelSyncStatus.ONGOING,
      },
    ],
    associations = [] as { messageId: string }[],
    messages = [] as {
      id: string;
      subject: string | null;
      receivedAt: Date | null;
    }[],
    participantGroupRows = [] as {
      handle: string;
      displayName: string | null;
      messageCount: string;
    }[],
  } = {}) => {
    const connectedAccountRepository = {
      find: jest.fn().mockResolvedValue(connectedAccounts),
    };
    const messageChannelRepository = {
      find: jest.fn().mockResolvedValue(messageChannels),
    };

    const associationRepository = {
      find: jest.fn().mockResolvedValue(associations),
    };
    const messageRepository = {
      find: jest.fn().mockResolvedValue(messages),
    };
    const participantQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(participantGroupRows),
    };
    const participantRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(participantQueryBuilder),
    };

    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((callback: () => unknown) => callback()),
      getRepository: jest.fn().mockImplementation((_workspaceId, entity) => {
        if (entity === MessageChannelMessageAssociationWorkspaceEntity) {
          return Promise.resolve(associationRepository);
        }
        if (entity === MessageWorkspaceEntity) {
          return Promise.resolve(messageRepository);
        }
        if (entity === MessageParticipantWorkspaceEntity) {
          return Promise.resolve(participantRepository);
        }

        return Promise.reject(new Error('unexpected repository'));
      }),
    };

    const service = new OnboardingEmailDigestService(
      connectedAccountRepository as never,
      messageChannelRepository as never,
      globalWorkspaceOrmManager as never,
    );

    return {
      service,
      connectedAccountRepository,
      messageChannelRepository,
      associationRepository,
      messageRepository,
      participantQueryBuilder,
      globalWorkspaceOrmManager,
    };
  };

  it('should report not connected when the user has no connected account', async () => {
    const { service, globalWorkspaceOrmManager } = buildService({
      connectedAccounts: [],
    });

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(result).toEqual({ syncState: 'NOT_CONNECTED' });
    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('should report not connected when the account has no message channel', async () => {
    const { service } = buildService({ messageChannels: [] });

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(result).toEqual({ syncState: 'NOT_CONNECTED' });
  });

  it('should only read accounts belonging to the requesting user', async () => {
    const { service, connectedAccountRepository } = buildService();

    await service.buildDigestForUser({ workspaceId, userWorkspaceId });

    expect(connectedAccountRepository.find).toHaveBeenCalledWith({
      where: { workspaceId, userWorkspaceId },
    });
  });

  it('should report an importing empty digest before any message landed', async () => {
    const { service } = buildService();

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(result).toEqual({
      syncState: 'IMPORTING',
      connectedAccountHandle: 'Admin@acme.com',
      importedMessageCount: 0,
      topContacts: [],
      topCompanyDomains: [],
      recentSubjects: [],
    });
  });

  it('should build the full digest from non-draft messages and drop own, alias, and group handles', async () => {
    const built = buildService({
      associations: [
        { messageId: 'message-1' },
        { messageId: 'message-2' },
        { messageId: 'message-2' },
        { messageId: 'draft-message' },
      ],
      messages: [
        {
          id: 'message-1',
          subject: 'Q3 renewal',
          receivedAt: new Date('2026-08-05'),
        },
        {
          id: 'message-2',
          subject: 'Re: Q3 renewal',
          receivedAt: new Date('2026-08-04'),
        },
      ],
      participantGroupRows: [
        {
          handle: 'jane@corp.com',
          displayName: 'Jane Doe',
          messageCount: '12',
        },
        { handle: 'admin@acme.com', displayName: null, messageCount: '40' },
        { handle: 'alias@acme.com', displayName: null, messageCount: '9' },
        { handle: 'noreply@corp.com', displayName: null, messageCount: '7' },
        { handle: 'sam@gmail.com', displayName: 'Sam', messageCount: '3' },
      ],
    });

    const { service, participantQueryBuilder } = built;

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(participantQueryBuilder.where).toHaveBeenCalledWith(
      'participant.messageId IN (:...messageIds)',
      { messageIds: ['message-1', 'message-2'] },
    );

    expect(result).toEqual({
      syncState: 'IMPORTING',
      connectedAccountHandle: 'Admin@acme.com',
      importedMessageCount: 2,
      topContacts: [
        { handle: 'jane@corp.com', displayName: 'Jane Doe', messageCount: 12 },
        { handle: 'sam@gmail.com', displayName: 'Sam', messageCount: 3 },
      ],
      topCompanyDomains: [{ domain: 'corp.com', messageCount: 12 }],
      recentSubjects: [{ subject: 'Q3 renewal', receivedAt: '2026-08-05' }],
    });
  });

  it('should report an empty digest without querying participants when every imported message is a draft', async () => {
    const { service, participantQueryBuilder } = buildService({
      associations: [{ messageId: 'draft-message' }],
      messages: [],
    });

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(result).toEqual({
      syncState: 'IMPORTING',
      connectedAccountHandle: 'Admin@acme.com',
      importedMessageCount: 0,
      topContacts: [],
      topCompanyDomains: [],
      recentSubjects: [],
    });
    expect(participantQueryBuilder.getRawMany).not.toHaveBeenCalled();
  });

  it('should return null instead of throwing when a query fails', async () => {
    const { service, messageChannelRepository } = buildService();

    messageChannelRepository.find.mockRejectedValue(new Error('db down'));

    const result = await service.buildDigestForUser({
      workspaceId,
      userWorkspaceId,
    });

    expect(result).toBeNull();
  });
});
