import {
  type LanguageModel,
  type ModelMessage,
  type PrepareStepFunction,
  type PrepareStepResult,
  type StepResult,
  type StopCondition,
  streamText,
  type ToolSet,
  type UserModelMessage,
} from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { ChatExecutionService } from 'src/engine/metadata-modules/ai/ai-chat/services/chat-execution.service';
import { ASK_QUESTIONS_TOOL_NAME } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';

jest.mock('ai', () => ({
  ...jest.requireActual('ai'),
  streamText: jest.fn(),
}));

const streamTextMock = streamText as unknown as jest.Mock;

const buildStep = (
  toolCalls: Array<{ toolName: string; input: unknown }>,
): StepResult<ToolSet> => ({ toolCalls }) as unknown as StepResult<ToolSet>;

const buildVariedSteps = (count: number): StepResult<ToolSet>[] =>
  Array.from({ length: count }, (_, index) =>
    buildStep([{ toolName: 'search_records', input: { page: index } }]),
  );

const buildIdenticalSteps = (count: number): StepResult<ToolSet>[] =>
  Array.from({ length: count }, () =>
    buildStep([
      {
        toolName: 'execute_tool',
        input: {
          toolName: 'get_workflow_current_version',
          input: { workflowId: 'workflow-1' },
        },
      },
    ]),
  );

const baseMessages: ModelMessage[] = [{ role: 'user', content: 'Hello' }];

type CapturedStreamTextOptions = {
  stopWhen: StopCondition<ToolSet>;
  prepareStep: PrepareStepFunction<ToolSet>;
};

describe('ChatExecutionService', () => {
  const buildService = () =>
    new ChatExecutionService(
      {
        buildToolIndex: jest.fn().mockResolvedValue([]),
        getToolsByName: jest.fn().mockResolvedValue({}),
      } as never,
      {
        findAllFlatSkills: jest.fn().mockResolvedValue([]),
        findFlatSkillsByNames: jest.fn().mockResolvedValue([]),
      } as never,
      {
        validateModelAvailability: jest.fn(),
        resolveModelForAgent: jest.fn().mockResolvedValue({
          modelId: 'test-model',
          sdkPackage: '@ai-sdk/openai',
          model: 'test-model' as LanguageModel,
        }),
        getEffectiveModelConfig: jest.fn().mockReturnValue({
          modalities: [],
          contextWindowTokens: 200000,
        }),
      } as never,
      {
        calculateCost: jest.fn().mockReturnValue(0),
        emitAiTokenUsageEvent: jest.fn().mockResolvedValue(undefined),
        billNativeWebSearchUsage: jest.fn().mockResolvedValue(undefined),
        decrementAndCheckAvailableCredits: jest.fn().mockResolvedValue({
          hasNoMoreAvailableCredits: false,
        }),
      } as never,
      {
        buildUserAndAgentActorContext: jest.fn().mockResolvedValue({
          actorContext: {},
          roleId: 'role-id',
          userId: 'user-id',
          userContext: { locale: 'en', timezone: 'UTC' },
        }),
      } as never,
      { buildWorkspaceURL: jest.fn() } as never,
      { isEnabled: jest.fn().mockReturnValue(false) } as never,
      { buildFullPrompt: jest.fn().mockReturnValue('system prompt') } as never,
      { captureExceptions: jest.fn() } as never,
      { bind: jest.fn().mockReturnValue({}) } as never,
      {
        pruneIfOverContextWindowLimit: jest
          .fn()
          .mockImplementation((modelMessages: ModelMessage[]) => ({
            messages: modelMessages,
            isStillOverLimit: false,
            wasPruned: false,
          })),
      } as never,
      {
        recordHistogram: jest.fn(),
        incrementCounterBy: jest.fn(),
      } as never,
    );

  const startStream = async (): Promise<CapturedStreamTextOptions> => {
    streamTextMock.mockReturnValue({
      usage: new Promise(() => {}),
      steps: new Promise(() => {}),
    });

    await buildService().streamChat({
      workspace: {
        id: 'workspace-id',
        smartModel: 'test-model',
        aiAdditionalInstructions: null,
      } as unknown as WorkspaceEntity,
      userWorkspaceId: 'user-workspace-id',
      messages: [
        {
          id: 'message-1',
          role: 'user',
          parts: [{ type: 'text', text: 'Hello' }],
        } as ExtendedUIMessage,
      ],
      browsingContext: null,
      conversationSizeTokens: 10,
    });

    return streamTextMock.mock.calls[
      streamTextMock.mock.calls.length - 1
    ][0] as CapturedStreamTextOptions;
  };

  const callPrepareStep = (
    prepareStep: PrepareStepFunction<ToolSet>,
    { stepNumber, steps }: { stepNumber: number; steps: StepResult<ToolSet>[] },
  ): PrepareStepResult<ToolSet> =>
    prepareStep({
      stepNumber,
      steps,
      messages: baseMessages,
      model: 'test-model' as LanguageModel,
      experimental_context: undefined,
    }) as PrepareStepResult<ToolSet>;

  const extractLastMessageText = (
    result: PrepareStepResult<ToolSet>,
  ): string => {
    const messages = result?.messages ?? [];
    const lastMessage = messages[messages.length - 1] as
      | UserModelMessage
      | undefined;

    if (lastMessage === undefined) {
      return '';
    }

    if (typeof lastMessage.content === 'string') {
      return lastMessage.content;
    }

    return lastMessage.content
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('');
  };

  it('keeps the checkpoint window within the absolute step ceiling', () => {
    expect(AGENT_CONFIG.CHECKPOINT_STEPS).toBe(40);
    expect(AGENT_CONFIG.CHECKPOINT_GRACE_STEPS).toBe(5);
    expect(AGENT_CONFIG.MAX_STEPS).toBe(120);
    expect(
      AGENT_CONFIG.CHECKPOINT_STEPS + AGENT_CONFIG.CHECKPOINT_GRACE_STEPS,
    ).toBeLessThan(AGENT_CONFIG.MAX_STEPS);
  });

  it('stops at the absolute step ceiling', async () => {
    const { stopWhen } = await startStream();

    expect(
      await stopWhen({ steps: buildVariedSteps(AGENT_CONFIG.MAX_STEPS) }),
    ).toBe(true);
    expect(
      await stopWhen({ steps: buildVariedSteps(AGENT_CONFIG.MAX_STEPS - 1) }),
    ).toBe(false);
  });

  it('stops when ask_questions is called', async () => {
    const { stopWhen } = await startStream();

    const steps = [
      ...buildVariedSteps(2),
      buildStep([{ toolName: ASK_QUESTIONS_TOOL_NAME, input: {} }]),
    ];

    expect(await stopWhen({ steps })).toBe(true);
  });

  it('does not inject a reminder before the checkpoint', async () => {
    const { prepareStep } = await startStream();

    const result = callPrepareStep(prepareStep, {
      stepNumber: AGENT_CONFIG.CHECKPOINT_STEPS - 1,
      steps: buildVariedSteps(AGENT_CONFIG.CHECKPOINT_STEPS - 1),
    });

    expect(result?.messages).toHaveLength(baseMessages.length);
  });

  it('injects the checkpoint reminder once the checkpoint step is reached', async () => {
    const { prepareStep } = await startStream();

    const result = callPrepareStep(prepareStep, {
      stepNumber: AGENT_CONFIG.CHECKPOINT_STEPS,
      steps: buildVariedSteps(AGENT_CONFIG.CHECKPOINT_STEPS),
    });

    expect(result?.messages).toHaveLength(baseMessages.length + 1);
    const reminderText = extractLastMessageText(result);

    expect(reminderText).toContain('step checkpoint');
    expect(reminderText).toContain(
      `${AGENT_CONFIG.CHECKPOINT_STEPS} tool-calling steps`,
    );
    expect(reminderText).toContain('Stop calling tools');
  });

  it('keeps injecting the checkpoint reminder during the grace window', async () => {
    const { prepareStep } = await startStream();

    callPrepareStep(prepareStep, {
      stepNumber: AGENT_CONFIG.CHECKPOINT_STEPS,
      steps: buildVariedSteps(AGENT_CONFIG.CHECKPOINT_STEPS),
    });

    const result = callPrepareStep(prepareStep, {
      stepNumber: AGENT_CONFIG.CHECKPOINT_STEPS + 2,
      steps: buildVariedSteps(AGENT_CONFIG.CHECKPOINT_STEPS + 2),
    });

    expect(extractLastMessageText(result)).toContain('step checkpoint');
  });

  it('hard-stops at checkpoint plus grace steps once the checkpoint is reached', async () => {
    const { prepareStep, stopWhen } = await startStream();

    callPrepareStep(prepareStep, {
      stepNumber: AGENT_CONFIG.CHECKPOINT_STEPS,
      steps: buildVariedSteps(AGENT_CONFIG.CHECKPOINT_STEPS),
    });

    const hardStopStepCount =
      AGENT_CONFIG.CHECKPOINT_STEPS + AGENT_CONFIG.CHECKPOINT_GRACE_STEPS;

    expect(
      await stopWhen({ steps: buildVariedSteps(hardStopStepCount - 1) }),
    ).toBe(false);
    expect(await stopWhen({ steps: buildVariedSteps(hardStopStepCount) })).toBe(
      true,
    );
  });

  it('does not hard-stop at checkpoint plus grace steps when the checkpoint was never reached', async () => {
    const { stopWhen } = await startStream();

    expect(
      await stopWhen({
        steps: buildVariedSteps(
          AGENT_CONFIG.CHECKPOINT_STEPS + AGENT_CONFIG.CHECKPOINT_GRACE_STEPS,
        ),
      }),
    ).toBe(false);
  });

  it('warns the model when the same tool call is repeated three times in a row', async () => {
    const { prepareStep } = await startStream();

    const result = callPrepareStep(prepareStep, {
      stepNumber: 3,
      steps: buildIdenticalSteps(3),
    });

    const reminderText = extractLastMessageText(result);

    expect(reminderText).toContain('get_workflow_current_version');
    expect(reminderText).toContain('Do not repeat this exact call');
  });

  it('injects the repeated call warning only on the step after detection', async () => {
    const { prepareStep } = await startStream();

    callPrepareStep(prepareStep, {
      stepNumber: 3,
      steps: buildIdenticalSteps(3),
    });

    const result = callPrepareStep(prepareStep, {
      stepNumber: 4,
      steps: [...buildIdenticalSteps(3), ...buildVariedSteps(1)],
    });

    expect(result?.messages).toHaveLength(baseMessages.length);
  });

  it('stops gracefully when the repeated call happens again after the warning', async () => {
    const { prepareStep, stopWhen } = await startStream();

    callPrepareStep(prepareStep, {
      stepNumber: 3,
      steps: buildIdenticalSteps(3),
    });

    const result = callPrepareStep(prepareStep, {
      stepNumber: 4,
      steps: buildIdenticalSteps(4),
    });

    const reminderText = extractLastMessageText(result);

    expect(reminderText).toContain('after being warned');
    expect(reminderText).toContain('Stop calling tools');

    expect(
      await stopWhen({
        steps: buildVariedSteps(4 + AGENT_CONFIG.CHECKPOINT_GRACE_STEPS - 1),
      }),
    ).toBe(false);
    expect(
      await stopWhen({
        steps: buildVariedSteps(4 + AGENT_CONFIG.CHECKPOINT_GRACE_STEPS),
      }),
    ).toBe(true);
  });
});
