import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { SetuAiTaskExecutionService } from 'src/engine/metadata-modules/ai/ai-tasks/services/setu-ai-task-execution.service';

const usage = {
  requests: 2,
  inputTokens: 900,
  outputTokens: 100,
  totalTokens: 1_000,
  webSearchCalls: 1,
};

const buildTask = (overrides: Record<string, unknown> = {}) => ({
  id: 'task-id',
  workspaceId: 'workspace-id',
  initiatorUserWorkspaceId: 'user-workspace-id',
  threadId: null,
  modelId: 'chatgpt-plan/gpt-6.1-sol',
  request: { focus: null, saveBriefsAsNotes: false },
  ...overrides,
});

const buildStep = (overrides: Record<string, unknown> = {}) => ({
  id: 'step-id',
  taskId: 'task-id',
  companyId: 'company-id',
  companyName: 'Orbit',
  attempts: 1,
  fencingToken: 3,
  reservedTokens: 200_000,
  checkpoint: {},
  ...overrides,
});

const briefResult = {
  outcome: 'brief',
  output: {
    summary: 'Orbit builds satellites.',
    sections: [
      {
        heading: 'Overview',
        body: 'Satellites.',
        evidenceIds: ['record:company:company-id'],
      },
    ],
    unknowns: [],
    suggestedNextSteps: [],
  },
  usage,
  retrievedCrmSources: {
    company: {
      sourceId: 'record:company:company-id',
      objectNameSingular: 'company',
      recordId: 'company-id',
      label: 'Orbit',
      data: {},
    },
    people: [],
    opportunities: [],
    notes: [],
    tasks: [],
    unavailableSections: [],
  },
  citedUrls: [],
};

const build = ({
  task = buildTask(),
  step = buildStep(),
  claim = { status: 'claimed', task, step } as Record<string, unknown>,
  runResult = briefResult as Record<string, unknown>,
  isFlagEnabled = true,
  saveBriefResult = 'note-id' as string | null,
} = {}) => {
  const ledgerService = {
    findById: jest.fn().mockResolvedValue(task),
    claimNextStep: jest.fn().mockResolvedValue(claim),
    finishStep: jest.fn().mockResolvedValue(true),
    saveCheckpoint: jest.fn().mockResolvedValue(true),
    isCancelRequested: jest.fn().mockResolvedValue(false),
    cancelBySystem: jest.fn().mockResolvedValue(undefined),
  };
  const researchRunner = { run: jest.fn().mockResolvedValue(runResult) };
  const researchNoteService = {
    saveBrief: jest.fn().mockResolvedValue(saveBriefResult),
  };
  const aiBillingService = {
    assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    calculateAndBillUsage: jest.fn().mockResolvedValue(undefined),
    billNativeWebSearchUsage: jest.fn().mockResolvedValue(undefined),
  };
  const service = new SetuAiTaskExecutionService(
    ledgerService as never,
    {
      resolve: jest.fn().mockResolvedValue({
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
        authContext: {},
        rolePermissionConfig: { unionOf: ['role'] },
      }),
    } as never,
    { isFeatureEnabled: jest.fn().mockResolvedValue(isFlagEnabled) } as never,
    researchRunner as never,
    { load: jest.fn() } as never,
    researchNoteService as never,
    aiBillingService as never,
    {} as never,
  );

  return {
    service,
    ledgerService,
    researchRunner,
    researchNoteService,
    aiBillingService,
  };
};

const run = (service: SetuAiTaskExecutionService) =>
  service.runNextStep({ taskId: 'task-id', leaseOwner: 'worker' });

describe('SetuAiTaskExecutionService', () => {
  it('commits a validated brief and bills the run once', async () => {
    const { service, ledgerService, aiBillingService } = build();

    expect(await run(service)).toBe('ran');

    const [{ finish, usage: recordedUsage }] =
      ledgerService.finishStep.mock.calls[0];

    expect(finish.status).toBe('completed');
    expect(finish.brief.sections[0].evidenceIds).toEqual([
      'record:company:company-id',
    ]);
    expect(recordedUsage).toEqual(usage);
    expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledTimes(1);
    expect(aiBillingService.calculateAndBillUsage).toHaveBeenCalledWith(
      'chatgpt-plan/gpt-6.1-sol',
      { usage: { inputTokens: 900, outputTokens: 100 } },
      'workspace-id',
      UsageOperationType.AI_RESEARCH_TOKEN,
      null,
      'user-workspace-id',
    );
    expect(aiBillingService.billNativeWebSearchUsage).toHaveBeenCalledWith(
      1,
      'workspace-id',
      'user-workspace-id',
    );
  });

  it('leaves steps queued while the workspace gate is off', async () => {
    const { service, ledgerService } = build({ isFlagEnabled: false });

    expect(await run(service)).toBe('paused');
    expect(ledgerService.claimNextStep).not.toHaveBeenCalled();
  });

  it('pauses a step for a clarification and versions the question', async () => {
    const { service, ledgerService } = build({
      step: buildStep({
        checkpoint: {
          answers: [
            { version: 1, prompt: 'Earlier?', values: { answer: 'x' } },
          ],
        },
      }),
      runResult: {
        outcome: 'clarification',
        prompt: 'Two companies match. Which website?',
        fields: [{ name: 'answer', label: 'Website', type: 'TEXT' }],
        usage,
        retrievedCrmSources: null,
        citedUrls: [],
      },
    });

    await run(service);

    const [{ finish }] = ledgerService.finishStep.mock.calls[0];

    expect(finish.status).toBe('waiting_input');
    expect(finish.pendingInput.version).toBe(2);
  });

  it('passes earlier answers back to the research run when resuming', async () => {
    const answers = [
      {
        version: 1,
        prompt: 'Which website?',
        values: { answer: 'orbit.example' },
      },
    ];
    const { service, researchRunner } = build({
      step: buildStep({ checkpoint: { answers } }),
    });

    await run(service);

    expect(researchRunner.run.mock.calls[0][0].answers).toEqual(answers);
  });

  it('requeues a retryable failure once, then fails the step', async () => {
    const failure = {
      outcome: 'failed',
      errorCode: 'RESEARCH_FAILED',
      isRetryable: true,
      usage,
      retrievedCrmSources: null,
      citedUrls: [],
    };
    const first = build({ runResult: failure });

    await run(first.service);
    expect(first.ledgerService.finishStep.mock.calls[0][0].finish.status).toBe(
      'queued',
    );

    const last = build({
      runResult: failure,
      step: buildStep({ attempts: 2 }),
    });

    await run(last.service);
    expect(last.ledgerService.finishStep.mock.calls[0][0].finish).toEqual({
      status: 'failed',
      errorCode: 'RESEARCH_FAILED',
    });
  });

  it('reserves the note id before saving, so a retry reuses the same note', async () => {
    const { service, ledgerService, researchNoteService } = build({
      task: buildTask({
        request: { focus: null, saveBriefsAsNotes: true },
      }),
      step: buildStep({
        checkpoint: {
          reservedNoteId: 'reserved-note-id',
          reservedNoteTargetId: 'reserved-target-id',
        },
      }),
    });

    await run(service);

    expect(
      ledgerService.saveCheckpoint.mock.invocationCallOrder[0],
    ).toBeLessThan(researchNoteService.saveBrief.mock.invocationCallOrder[0]);
    expect(researchNoteService.saveBrief).toHaveBeenCalledWith(
      expect.objectContaining({
        noteId: 'reserved-note-id',
        noteTargetId: 'reserved-target-id',
      }),
    );
    expect(
      ledgerService.finishStep.mock.calls[0][0].finish.brief.savedNoteId,
    ).toBe('note-id');
  });

  it('never saves a note unless the person asked for it', async () => {
    const { service, researchNoteService } = build();

    await run(service);

    expect(researchNoteService.saveBrief).not.toHaveBeenCalled();
  });

  it('stops without running when nothing is claimable', async () => {
    const { service, researchRunner } = build({
      claim: { status: 'nothing_to_run' },
    });

    expect(await run(service)).toBe('nothing_to_run');
    expect(researchRunner.run).not.toHaveBeenCalled();
  });
});
