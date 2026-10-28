import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { AgentInboxAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-inbox-access.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

const WORKSPACE_ID = 'workspace-id';
const THREAD_ID = 'thread-id';
const CHANNEL_ID = 'channel-id';
const APPLICATION_ROLE_ID = 'application-role-id';
const THREAD_OBJECT_METADATA_ID = 'thread-object-metadata-id';

const APPLICATION = {
  id: 'application-id',
  defaultRoleId: APPLICATION_ROLE_ID,
};

const buildRoleGrant = ({
  principalId = APPLICATION_ROLE_ID,
  accessLevel,
}: {
  principalId?: string;
  accessLevel: RecordShareAccessLevel;
}) => ({
  id: `${principalId}-${accessLevel}`,
  objectMetadataId: THREAD_OBJECT_METADATA_ID,
  recordId: THREAD_ID,
  principalId,
  principalType: RecordSharePrincipalType.ROLE,
  accessLevel,
  rowCause: 'MANUAL',
  sourceId: THREAD_ID,
});

const buildService = ({
  thread = { id: THREAD_ID, channelId: null },
  isParticipant = false,
  threadShares = [],
  canAccessAllAgentChatChannels = false,
}: {
  thread?: { id: string; channelId: string | null } | null;
  isParticipant?: boolean;
  threadShares?: ReturnType<typeof buildRoleGrant>[];
  canAccessAllAgentChatChannels?: boolean;
} = {}) => {
  const threadRepository = { findOne: jest.fn().mockResolvedValue(thread) };
  const messageRepository = {
    existsBy: jest.fn().mockResolvedValue(isParticipant),
  };
  const threadService = {
    getWritableThread: jest.fn().mockResolvedValue(thread),
  };
  const sharingService = {
    getThreadObjectMetadataId: jest
      .fn()
      .mockResolvedValue(THREAD_OBJECT_METADATA_ID),
  };
  const recordShareStorageService = {
    findByRecordIds: jest.fn().mockResolvedValue(threadShares),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatRoleMaps: {
        universalIdentifierById: {
          [APPLICATION_ROLE_ID]: 'application-role-universal-identifier',
        },
        byUniversalIdentifier: {
          'application-role-universal-identifier': {
            id: APPLICATION_ROLE_ID,
            canAccessAllAgentChatChannels,
          },
        },
      },
    }),
  };

  const service = new AgentInboxAccessService(
    threadRepository as never,
    messageRepository as never,
    threadService as never,
    sharingService as never,
    recordShareStorageService as never,
    workspaceCacheService as never,
  );

  return {
    service,
    messageRepository,
    threadService,
    recordShareStorageService,
  };
};

const getApplicationWritableThread = (
  service: AgentInboxAccessService,
  application: { id: string; defaultRoleId: string | null } = APPLICATION,
) =>
  service.getWritableThread({
    authContext: {
      type: 'application',
      workspace: { id: WORKSPACE_ID },
      application,
    } as never,
    threadId: THREAD_ID,
  });

describe('AgentInboxAccessService', () => {
  it('lets a member act on a chat with their own access', async () => {
    const { service, threadService } = buildService();

    await service.getWritableThread({
      authContext: {
        type: 'user',
        workspace: { id: WORKSPACE_ID },
        workspaceMemberId: 'member-id',
      } as unknown as UserWorkspaceAuthContext,
      threadId: THREAD_ID,
    });

    expect(threadService.getWritableThread).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceMemberId: 'member-id',
      threadId: THREAD_ID,
    });
  });

  it('lets an application act on a chat it wrote in', async () => {
    const { service, messageRepository } = buildService({
      isParticipant: true,
    });

    await expect(getApplicationWritableThread(service)).resolves.toEqual({
      id: THREAD_ID,
      channelId: null,
    });
    expect(messageRepository.existsBy).toHaveBeenCalledWith(WORKSPACE_ID, {
      threadId: THREAD_ID,
      senderApplicationId: APPLICATION.id,
    });
  });

  it.each([RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL])(
    'lets an application act on a chat its role was granted %s on',
    async (accessLevel) => {
      const { service } = buildService({
        threadShares: [buildRoleGrant({ accessLevel })],
      });

      await expect(getApplicationWritableThread(service)).resolves.toEqual({
        id: THREAD_ID,
        channelId: null,
      });
    },
  );

  it('refuses an application whose role can only read the chat', async () => {
    const { service } = buildService({
      threadShares: [
        buildRoleGrant({ accessLevel: RecordShareAccessLevel.READ }),
      ],
    });

    await expect(getApplicationWritableThread(service)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_NOT_FOUND,
    });
  });

  it('refuses an application when the chat is granted to another role', async () => {
    const { service } = buildService({
      threadShares: [
        buildRoleGrant({
          principalId: 'other-role-id',
          accessLevel: RecordShareAccessLevel.FULL,
        }),
      ],
    });

    await expect(getApplicationWritableThread(service)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_NOT_FOUND,
    });
  });

  it('lets an application whose role reaches every channel act on a channel chat', async () => {
    const { service, recordShareStorageService } = buildService({
      thread: { id: THREAD_ID, channelId: CHANNEL_ID },
      canAccessAllAgentChatChannels: true,
    });

    await expect(getApplicationWritableThread(service)).resolves.toEqual({
      id: THREAD_ID,
      channelId: CHANNEL_ID,
    });
    expect(recordShareStorageService.findByRecordIds).not.toHaveBeenCalled();
  });

  it('refuses an application whose role reaches every channel on a chat outside channels', async () => {
    const { service } = buildService({ canAccessAllAgentChatChannels: true });

    await expect(getApplicationWritableThread(service)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_NOT_FOUND,
    });
  });

  it('refuses an application without a role that did not write in the chat', async () => {
    const { service, recordShareStorageService } = buildService({
      threadShares: [
        buildRoleGrant({ accessLevel: RecordShareAccessLevel.FULL }),
      ],
    });

    await expect(
      getApplicationWritableThread(service, {
        id: APPLICATION.id,
        defaultRoleId: null,
      }),
    ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    expect(recordShareStorageService.findByRecordIds).not.toHaveBeenCalled();
  });

  it('reports a chat that does not exist as not found', async () => {
    const { service, messageRepository } = buildService({ thread: null });

    await expect(getApplicationWritableThread(service)).rejects.toMatchObject({
      code: AiExceptionCode.THREAD_NOT_FOUND,
    });
    expect(messageRepository.existsBy).not.toHaveBeenCalled();
  });

  describe('assertApplicationParticipatesInThread', () => {
    it('refuses an application its role lets write but that never wrote in the chat', async () => {
      const { service } = buildService({
        threadShares: [
          buildRoleGrant({ accessLevel: RecordShareAccessLevel.FULL }),
        ],
      });

      await expect(
        service.assertApplicationParticipatesInThread({
          workspaceId: WORKSPACE_ID,
          application: APPLICATION,
          threadId: THREAD_ID,
        }),
      ).rejects.toMatchObject({ code: AiExceptionCode.THREAD_NOT_FOUND });
    });

    it('accepts an application that wrote in the chat', async () => {
      const { service } = buildService({ isParticipant: true });

      await expect(
        service.assertApplicationParticipatesInThread({
          workspaceId: WORKSPACE_ID,
          application: APPLICATION,
          threadId: THREAD_ID,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
