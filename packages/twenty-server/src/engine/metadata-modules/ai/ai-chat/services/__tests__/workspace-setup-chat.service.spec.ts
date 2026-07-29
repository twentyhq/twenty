import { WORKSPACE_SETUP_CHAT_THREAD_TITLE } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { WORKSPACE_SETUP_CHAT_MODEL_ID } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-chat-model-id.constant';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { WorkspaceSetupChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/workspace-setup-chat.service';
import { WORKSPACE_SETUP_CHAT_THREAD_KEY } from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-chat-key-value.type';
import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('WorkspaceSetupChatService', () => {
  const workspace = {
    id: 'workspace-id',
    smartModel: 'smart-model-id',
  } as WorkspaceEntity;

  const startArguments = {
    userId: 'creator-user-id',
    userWorkspaceId: 'user-workspace-id',
    workspace,
    companyContext: null,
  };

  const buildService = () => {
    const keyValueState: { value: { threadId: string } | null } = {
      value: null,
    };

    const userWorkspaceState = {
      creatorUserId: 'creator-user-id',
      locale: 'fr-FR',
    };

    const userWorkspaceRepository = {
      findOne: jest
        .fn()
        .mockImplementation(({ where }) =>
          Promise.resolve(
            isDefined(where?.id)
              ? { id: where.id, locale: userWorkspaceState.locale }
              : { userId: userWorkspaceState.creatorUserId },
          ),
        ),
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
      validateModelAvailability: jest.fn(),
    };
    const keyValuePairService = {
      get: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            isDefined(keyValueState.value)
              ? [{ value: keyValueState.value }]
              : [],
          ),
        ),
      trySetIfAbsent: jest.fn().mockImplementation(({ value }) => {
        if (!isDefined(keyValueState.value)) {
          keyValueState.value = value;
        }

        return Promise.resolve();
      }),
      deleteIfValueEquals: jest.fn().mockImplementation(({ value }) => {
        if (keyValueState.value?.threadId === value.threadId) {
          keyValueState.value = null;
        }

        return Promise.resolve();
      }),
    };
    const agentChatService = {
      findThreadById: jest.fn().mockResolvedValue(null),
      createThread: jest.fn().mockResolvedValue(undefined),
      hardDeleteThread: jest.fn().mockResolvedValue(undefined),
      getThreadById: jest.fn().mockImplementation(({ threadId }) =>
        Promise.resolve({
          id: threadId,
          deletedAt: null,
          activeStreamId: null,
        }),
      ),
      unarchiveThread: jest.fn().mockResolvedValue(undefined),
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

    const service = new WorkspaceSetupChatService(
      userWorkspaceRepository as never,
      twentyConfigService as never,
      billingUsageService as never,
      aiModelRegistryService as never,
      keyValuePairService as never,
      agentChatService as never,
      agentChatStreamingService as never,
    );

    return {
      service,
      keyValueState,
      userWorkspaceState,
      userWorkspaceRepository,
      twentyConfigService,
      billingUsageService,
      aiModelRegistryService,
      keyValuePairService,
      agentChatService,
      agentChatStreamingService,
    };
  };

  it('should return unavailable without any thread or key-value writes when the onboarding ai chat is disabled', async () => {
    const {
      service,
      twentyConfigService,
      keyValuePairService,
      agentChatService,
    } = buildService();

    twentyConfigService.get.mockReturnValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      threadId: null,
    });
    expect(twentyConfigService.get).toHaveBeenCalledWith(
      'IS_ONBOARDING_AI_CHAT_ENABLED',
    );
    expect(agentChatService.createThread).not.toHaveBeenCalled();
    expect(keyValuePairService.get).not.toHaveBeenCalled();
    expect(keyValuePairService.trySetIfAbsent).not.toHaveBeenCalled();
  });

  it('should return unavailable when the caller is not the workspace creator', async () => {
    const { service, userWorkspaceState, agentChatService } = buildService();

    userWorkspaceState.creatorUserId = 'another-user-id';

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      threadId: null,
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
      threadId: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should return unavailable without throwing when no candidate model is available', async () => {
    const { service, aiModelRegistryService, agentChatService } =
      buildService();

    aiModelRegistryService.validateModelAvailability.mockImplementation(() => {
      throw new Error('model is not available');
    });

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      threadId: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should start the kickoff stream with the workspace setup model', async () => {
    const { service, agentChatStreamingService } = buildService();

    await service.startWorkspaceSetupChat(startArguments);

    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ modelId: WORKSPACE_SETUP_CHAT_MODEL_ID }),
    );
  });

  it('should fall back to the workspace smart model when the workspace setup model is unavailable', async () => {
    const { service, aiModelRegistryService, agentChatStreamingService } =
      buildService();

    aiModelRegistryService.validateModelAvailability.mockImplementation(
      (modelId: string) => {
        if (modelId === WORKSPACE_SETUP_CHAT_MODEL_ID) {
          throw new Error('model is not available');
        }
      },
    );

    await service.startWorkspaceSetupChat(startArguments);

    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ modelId: 'smart-model-id' }),
    );
  });

  it('should return unavailable without creating a thread when the workspace has no available credits', async () => {
    const { service, billingUsageService, agentChatService } = buildService();

    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      threadId: null,
    });
    expect(agentChatService.createThread).not.toHaveBeenCalled();
  });

  it('should join the existing conversation when credits ran out after the kickoff', async () => {
    const {
      service,
      keyValueState,
      billingUsageService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValueState.value = { threadId: 'existing-thread-id' };
    agentChatService.findThreadById.mockResolvedValue({
      id: 'existing-thread-id',
    });
    agentChatService.hasConversationMessages.mockResolvedValue(true);
    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      threadId: 'existing-thread-id',
    });
    expect(billingUsageService.hasAvailableCredits).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should not start a stream on an empty existing thread when credits ran out', async () => {
    const {
      service,
      keyValueState,
      billingUsageService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValueState.value = { threadId: 'existing-thread-id' };
    agentChatService.findThreadById.mockResolvedValue({
      id: 'existing-thread-id',
    });
    billingUsageService.hasAvailableCredits.mockResolvedValue(false);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.UNAVAILABLE,
      threadId: null,
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
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

  it('should create a titled thread, persist its pointer, and start the hidden kickoff stream when nothing is stored', async () => {
    const {
      service,
      keyValuePairService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatService.createThread).toHaveBeenCalledWith({
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
      id: expect.stringMatching(UUID_V4_PATTERN),
      title: WORKSPACE_SETUP_CHAT_THREAD_TITLE,
    });

    const createdThreadId = agentChatService.createThread.mock.calls[0][0].id;

    expect(keyValuePairService.trySetIfAbsent).toHaveBeenCalledWith({
      userId: 'creator-user-id',
      workspaceId: 'workspace-id',
      key: WORKSPACE_SETUP_CHAT_THREAD_KEY,
      value: { threadId: createdThreadId },
      type: KeyValuePairType.USER_VARIABLE,
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith({
      threadId: createdThreadId,
      userWorkspaceId: 'user-workspace-id',
      workspace,
      text: expect.stringContaining(
        'No information about the company that owns this workspace is available.',
      ),
      modelId: WORKSPACE_SETUP_CHAT_MODEL_ID,
    });
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      threadId: createdThreadId,
      streamId: 'stream-id',
      turnId: 'turn-id',
    });
  });

  it('should build the kickoff prompt with the language of the calling user workspace', async () => {
    const { service, userWorkspaceRepository, agentChatStreamingService } =
      buildService();

    await service.startWorkspaceSetupChat(startArguments);

    expect(userWorkspaceRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-workspace-id' },
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining(
          'The user locale is French, please continue the discussion in that language.',
        ),
      }),
    );
  });

  it('should build the kickoff prompt in English when the user workspace has no locale', async () => {
    const { service, userWorkspaceRepository, agentChatStreamingService } =
      buildService();

    userWorkspaceRepository.findOne.mockImplementation(({ where }) =>
      Promise.resolve(
        isDefined(where?.id) ? null : { userId: 'creator-user-id' },
      ),
    );

    await service.startWorkspaceSetupChat(startArguments);

    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining('The user locale is English'),
      }),
    );
  });

  it('should hard delete its own thread and use the winner thread when losing the key-value race', async () => {
    const {
      service,
      keyValueState,
      keyValuePairService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValuePairService.trySetIfAbsent.mockImplementation(() => {
      keyValueState.value = { threadId: 'winner-thread-id' };

      return Promise.resolve();
    });
    agentChatService.findThreadById.mockImplementation(({ threadId }) =>
      Promise.resolve(
        threadId === 'winner-thread-id' ? { id: 'winner-thread-id' } : null,
      ),
    );

    const result = await service.startWorkspaceSetupChat(startArguments);

    const losingThreadId = agentChatService.createThread.mock.calls[0][0].id;

    expect(agentChatService.hardDeleteThread).toHaveBeenCalledWith({
      threadId: losingThreadId,
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: 'winner-thread-id' }),
    );
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      threadId: 'winner-thread-id',
      streamId: 'stream-id',
      turnId: 'turn-id',
    });
  });

  it('should clear the stale pointer and create a fresh thread when the stored thread no longer exists', async () => {
    const { service, keyValueState, keyValuePairService, agentChatService } =
      buildService();

    keyValueState.value = { threadId: 'stale-thread-id' };

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(keyValuePairService.deleteIfValueEquals).toHaveBeenCalledWith({
      userId: 'creator-user-id',
      workspaceId: 'workspace-id',
      key: WORKSPACE_SETUP_CHAT_THREAD_KEY,
      value: { threadId: 'stale-thread-id' },
      type: KeyValuePairType.USER_VARIABLE,
    });
    expect(agentChatService.createThread).toHaveBeenCalledTimes(1);

    const freshThreadId = agentChatService.createThread.mock.calls[0][0].id;

    expect(freshThreadId).not.toBe('stale-thread-id');
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      threadId: freshThreadId,
      streamId: 'stream-id',
      turnId: 'turn-id',
    });
  });

  it('should return alreadyStarted without kicking off when the thread already has conversation messages', async () => {
    const {
      service,
      keyValueState,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValueState.value = { threadId: 'existing-thread-id' };
    agentChatService.findThreadById.mockResolvedValue({
      id: 'existing-thread-id',
    });
    agentChatService.hasConversationMessages.mockResolvedValue(true);

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      threadId: 'existing-thread-id',
    });
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should return alreadyStarted without kicking off when the active stream is still alive', async () => {
    const {
      service,
      keyValueState,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValueState.value = { threadId: 'existing-thread-id' };
    agentChatService.findThreadById.mockResolvedValue({
      id: 'existing-thread-id',
    });
    agentChatService.getThreadById.mockResolvedValue({
      id: 'existing-thread-id',
      deletedAt: null,
      activeStreamId: 'active-stream-id',
    });

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatStreamingService.reapDeadStream).toHaveBeenCalledWith({
      thread: expect.objectContaining({ activeStreamId: 'active-stream-id' }),
      workspaceId: 'workspace-id',
    });
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      threadId: 'existing-thread-id',
    });
    expect(agentChatService.hasConversationMessages).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });

  it('should return alreadyStarted when the hidden kickoff stream claim is lost', async () => {
    const { service, agentChatService, agentChatStreamingService } =
      buildService();

    agentChatStreamingService.startHiddenKickoffStream.mockResolvedValue(null);

    const result = await service.startWorkspaceSetupChat(startArguments);

    const createdThreadId = agentChatService.createThread.mock.calls[0][0].id;

    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.ALREADY_STARTED,
      threadId: createdThreadId,
    });
  });

  it('should unarchive an archived stored thread before kicking off', async () => {
    const {
      service,
      keyValueState,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValueState.value = { threadId: 'archived-thread-id' };
    agentChatService.findThreadById.mockResolvedValue({
      id: 'archived-thread-id',
    });
    agentChatService.getThreadById.mockResolvedValue({
      id: 'archived-thread-id',
      deletedAt: new Date(),
      activeStreamId: null,
    });

    const result = await service.startWorkspaceSetupChat(startArguments);

    expect(agentChatService.unarchiveThread).toHaveBeenCalledWith({
      threadId: 'archived-thread-id',
      userWorkspaceId: 'user-workspace-id',
      workspaceId: 'workspace-id',
    });
    expect(
      agentChatService.unarchiveThread.mock.invocationCallOrder[0],
    ).toBeLessThan(
      agentChatStreamingService.startHiddenKickoffStream.mock
        .invocationCallOrder[0],
    );
    expect(result).toEqual({
      outcome: WorkspaceSetupChatOutcome.STARTED,
      threadId: 'archived-thread-id',
      streamId: 'stream-id',
      turnId: 'turn-id',
    });
  });

  it('should throw an AiException when the stored thread keeps vanishing across all attempts', async () => {
    const {
      service,
      keyValuePairService,
      agentChatService,
      agentChatStreamingService,
    } = buildService();

    keyValuePairService.get.mockResolvedValue([
      { value: { threadId: 'vanishing-thread-id' } },
    ]);
    keyValuePairService.deleteIfValueEquals.mockResolvedValue(undefined);

    await expect(
      service.startWorkspaceSetupChat(startArguments),
    ).rejects.toThrow(AiException);

    expect(keyValuePairService.deleteIfValueEquals).toHaveBeenCalledTimes(3);
    expect(agentChatService.createThread).not.toHaveBeenCalled();
    expect(
      agentChatStreamingService.startHiddenKickoffStream,
    ).not.toHaveBeenCalled();
  });
});
