import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { QueryFailedError } from 'typeorm';
import { v5 } from 'uuid';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { WorkspaceSetupChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/workspace-setup-chat.service';
import { tagAiChatStreamScope } from 'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util';

jest.mock(
  'src/engine/metadata-modules/ai/ai-chat/utils/tag-ai-chat-stream-scope.util',
  () => ({
    tagAiChatStreamScope: jest.fn(),
  }),
);

// Pinned: changing the namespace or the name derivation would orphan the setup
// threads already created from it.
const WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE =
  '1e9195f3-c26a-4bfc-961e-dc317b4badbd';

const EXPECTED_THREAD_ID = v5(
  'workspace-id:user-workspace-id',
  WORKSPACE_SETUP_CHAT_THREAD_ID_NAMESPACE,
);

describe('WorkspaceSetupChatService', () => {
  const workspace = {
    id: 'workspace-id',
  } as WorkspaceEntity;

  const startArguments = {
    userId: 'creator-user-id',
    userLocale: 'en',
    userWorkspaceId: 'user-workspace-id',
    workspace,
    companyContext: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const buildService = () => {
    const workspaceMemberState: { locale: string | null } = {
      locale: 'fr-FR',
    };

    const twentyConfigService = {
      get: jest.fn().mockReturnValue(true),
    };
    const billingUsageService = {
      hasAvailableCredits: jest.fn().mockResolvedValue(true),
    };
    const aiModelRegistryService = {
      getAvailableModels: jest
        .fn()
        .mockReturnValue([{ modelId: 'smart-model-id' }]),
    };
    const userWorkspaceService = {
      isWorkspaceCreator: jest.fn().mockResolvedValue(true),
    };
    const translate = jest.fn().mockReturnValue('translated-workspace-setup');
    const i18nService = {
      getI18nInstance: jest.fn().mockReturnValue({ _: translate }),
    };
    const agentChatService = {
      findThreadById: jest.fn().mockResolvedValue(null),
      createThread: jest.fn().mockImplementation(({ id, title }) =>
        Promise.resolve({
          id,
          title,
          deletedAt: null,
          activeStreamId: null,
        }),
      ),
      unarchiveThread: jest.fn().mockImplementation(({ threadId }) =>
        Promise.resolve({
          id: threadId,
          deletedAt: null,
          activeStreamId: null,
        }),
      ),
      hasConversationMessages: jest.fn().mockResolvedValue(false),
    };
    const agentChatStreamingService = {
      reapDeadStream: jest.fn().mockResolvedValue(null),
      startHiddenKickoffStream: jest.fn().mockResolvedValue({
        streamId: 'stream-id',
        messageId: 'message-id',
        turnId: 'turn-id',
      }),
    };
    const globalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((callback: () => unknown) => callback()),
      getRepository: jest.fn().mockResolvedValue({
        findOne: jest
          .fn()
          .mockImplementation(() =>
            Promise.resolve(
              isDefined(workspaceMemberState.locale)
                ? { locale: workspaceMemberState.locale }
                : null,
            ),
          ),
      }),
    };

    const service = new WorkspaceSetupChatService(
      twentyConfigService as never,
      billingUsageService as never,
      aiModelRegistryService as never,
      userWorkspaceService as never,
      i18nService as never,
      agentChatService as never,
      agentChatStreamingService as never,
      globalWorkspaceOrmManager as never,
    );

    return {
      service,
      workspaceMemberState,
      twentyConfigService,
      billingUsageService,
      aiModelRegistryService,
      userWorkspaceService,
      i18nService,
      translate,
      agentChatService,
      agentChatStreamingService,
      globalWorkspaceOrmManager,
    };
  };

  it('should return unavailable without any thread interaction when the onboarding ai chat is disabled', async () => {
    const { service, twentyConfigService, agentChatService } = buildService();

    twentyConfigService.get.mockReturnValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      thread: null,
    });
    expect(twentyConfigService.get).toHaveBeenCalledWith(
      'IS_ONBOARDING_AI_CHAT_ENABLED',
    );
    expect(agentChatService.findThreadById).not.toHaveBeenCalled();
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should return unavailable when the caller is not the workspace creator', async () => {
    const { service, userWorkspaceService, agentChatService } = buildService();

    userWorkspaceService.isWorkspaceCreator.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      thread: null,
    });
    expect(userWorkspaceService.isWorkspaceCreator).toHaveBeenCalledWith({
      userId: 'creator-user-id',
      workspaceId: 'workspace-id',
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should return unavailable when no ai models are available', async () => {
    const { service, aiModelRegistryService, agentChatService } =
      buildService();

    aiModelRegistryService.getAvailableModels.mockReturnValue([]);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      thread: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should return unavailable without creating a thread when the workspace has no available credits', async () => {
    const { service, billingUsageService, agentChatService } = buildService();

    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      thread: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should create the thread under its deterministic id with a translated title and start the hidden kickoff stream', async () => {
    const {
      service,
      i18nService,
      translate,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatService.findThreadById).toHaveBeenCalledWith({
      threadId: EXPECTED_THREAD_ID,
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });
    expect(i18nService.getI18nInstance).toHaveBeenCalledWith('fr-FR');
    expect(translate).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Workspace setup' }),
    );
    expect(agentChatService.createThread).toHaveBeenCalledWith({
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
      id: EXPECTED_THREAD_ID,
      title: 'translated-workspace-setup',
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith({
      thread: expect.objectContaining({ id: EXPECTED_THREAD_ID }),
      userWorkspaceId: 'user-workspace-id',
      workspace,
      text: expect.stringContaining(
        'No information about the company that owns this workspace is available.',
      ),
    });
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      thread: expect.objectContaining({
        id: EXPECTED_THREAD_ID,
        title: 'translated-workspace-setup',
      }),
    });
    expect(tagAiChatStreamScope).toHaveBeenCalledWith({
      streamId: 'stream-id',
      turnId: 'turn-id',
      threadId: EXPECTED_THREAD_ID,
      workspaceId: 'workspace-id',
    });
  });

  it('should reuse the concurrently created thread when the insert hits a unique violation', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    const concurrentlyCreatedThread = {
      id: EXPECTED_THREAD_ID,
      deletedAt: null,
      activeStreamId: null,
    };

    agentChatService.findThreadById
      .mockResolvedValueOnce(null)
      .mockResolvedValue(concurrentlyCreatedThread);
    agentChatService.createThread.mockRejectedValue(
      Object.assign(
        new QueryFailedError('INSERT', [], new Error('duplicate key')),
        { code: '23505' },
      ),
    );

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatService.createThread).toHaveBeenCalledTimes(1);
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ thread: concurrentlyCreatedThread }),
    );
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      thread: concurrentlyCreatedThread,
    });
  });

  it('should rethrow a create failure that is not a unique violation', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    agentChatService.createThread.mockRejectedValue(
      new Error('connection lost'),
    );

    await expect(
      service.startWorkspaceSetupChat(startArguments),
    ).rejects.toThrow('connection lost');

    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should build the prompt with the workspace member locale rather than the user one', async () => {
    const { service, agentChatStreamingService } = buildService();

    await service.startWorkspaceSetupChat(startArguments);

    const kickoffText =
      agentChatStreamingService.startHiddenKickoffStream.mock.calls[0][0].text;

    expect(kickoffText).toContain(
      'The user locale is French, please continue the discussion in that language.',
    );
  });

  it('should fall back to the calling user locale when the workspace member has none', async () => {
    const {
      service,
      workspaceMemberState,
      i18nService,
      agentChatStreamingService,
    } = buildService();

    workspaceMemberState.locale = null;

    await service.startWorkspaceSetupChat(startArguments);

    const kickoffText =
      agentChatStreamingService.startHiddenKickoffStream.mock.calls[0][0].text;

    expect(kickoffText).toContain('The user locale is English');
    expect(i18nService.getI18nInstance).toHaveBeenCalledWith('en');
  });

  it('should embed the company context and the proposal instructions in the hidden prompt', async () => {
    const { service, agentChatStreamingService } = buildService();

    const companyContext = {
      domain: 'acme.com',
      enrichedAt: '2026-07-21T10:00:00.000Z',
      name: 'Acme Inc',
      website: 'https://acme.com',
      industry: 'computer software',
      employeeCount: 250,
      size: '51-200',
      founded: 2015,
      headline: 'Anvils as a service',
      summary: 'Acme sells anvils to coyotes.',
      tags: ['saas', 'b2b'],
      locality: 'San Francisco',
      region: 'California',
      country: 'United States',
    } satisfies WorkspaceCompanyEnrichment;

    await service.startWorkspaceSetupChat({
      ...startArguments,
      companyContext,
    });

    const kickoffText =
      agentChatStreamingService.startHiddenKickoffStream.mock.calls[0][0].text;

    expect(kickoffText).toContain('Domain: acme.com');
    expect(kickoffText).toContain('Name: Acme Inc');
    expect(kickoffText).toContain('Industry: computer software');
    expect(kickoffText).toContain('tailored to their business');
    expect(kickoffText).toContain(
      'Only propose until the user explicitly approves',
    );
    expect(kickoffText).toContain('metadata-building');
    expect(kickoffText).toContain(
      'The user locale is French, please continue the discussion in that language.',
    );
    expect(kickoffText).not.toContain('No information about the company');
  });

  it('should return alreadyStarted without a credit check when the thread already has conversation messages', async () => {
    const {
      service,
      billingUsageService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    const existingThread = {
      id: EXPECTED_THREAD_ID,
      deletedAt: null,
      activeStreamId: null,
    };

    agentChatService.findThreadById.mockResolvedValue(existingThread);
    agentChatService.hasConversationMessages.mockResolvedValue(true);
    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      thread: existingThread,
    });
    expect(billingUsageService.hasAvailableCredits).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should not start a stream on an empty existing thread when credits ran out', async () => {
    const {
      service,
      billingUsageService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    agentChatService.findThreadById.mockResolvedValue({
      id: EXPECTED_THREAD_ID,
      deletedAt: null,
      activeStreamId: null,
    });
    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      thread: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should return alreadyStarted without kicking off when the active stream is still alive', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    const streamingThread = {
      id: EXPECTED_THREAD_ID,
      deletedAt: null,
      activeStreamId: 'active-stream-id',
    };

    agentChatService.findThreadById.mockResolvedValue(streamingThread);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatStreamingService.reapDeadStream).toHaveBeenCalledWith({
      thread: streamingThread,
      workspaceId: 'workspace-id',
    });
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      thread: streamingThread,
    });
    expect(agentChatService.hasConversationMessages).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should kick off again when the active stream is dead', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    const interruptedThread = {
      id: EXPECTED_THREAD_ID,
      deletedAt: null,
      activeStreamId: 'dead-stream-id',
    };

    agentChatService.findThreadById.mockResolvedValue(interruptedThread);
    agentChatStreamingService.reapDeadStream.mockResolvedValue({
      code: 'CONNECTION_LOST',
      message: 'interrupted',
    });

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ thread: interruptedThread }),
    );
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      thread: interruptedThread,
    });
  });

  it('should return alreadyStarted when the hidden kickoff stream claim is lost', async () => {
    const { service, agentChatStreamingService } = buildService();

    agentChatStreamingService.startHiddenKickoffStream.mockResolvedValue(null);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      thread: expect.objectContaining({ id: EXPECTED_THREAD_ID }),
    });
    expect(tagAiChatStreamScope).not.toHaveBeenCalled();
  });

  it('should unarchive an archived thread before kicking off', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    agentChatService.findThreadById.mockResolvedValue({
      id: EXPECTED_THREAD_ID,
      deletedAt: new Date(),
      activeStreamId: null,
    });

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatService.unarchiveThread).toHaveBeenCalledWith({
      threadId: EXPECTED_THREAD_ID,
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });
    expect(
      agentChatService.unarchiveThread.mock.invocationCallOrder[0],
    ).toBeLessThan(
      agentChatStreamingService.startHiddenKickoffStream.mock
        .invocationCallOrder[0],
    );
    expect(agentChatService.createThread).not.toHaveBeenCalled();
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      thread: expect.objectContaining({
        id: EXPECTED_THREAD_ID,
        deletedAt: null,
      }),
    });
  });
});
