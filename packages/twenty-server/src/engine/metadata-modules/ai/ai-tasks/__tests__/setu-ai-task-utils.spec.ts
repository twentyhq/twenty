import { buildSetuAiResearchBrief } from 'src/engine/metadata-modules/ai/ai-tasks/utils/build-setu-ai-research-brief.util';
import { buildSetuAiResearchBriefMarkdown } from 'src/engine/metadata-modules/ai/ai-tasks/utils/build-setu-ai-research-brief-markdown.util';
import { deriveSetuAiTaskStatus } from 'src/engine/metadata-modules/ai/ai-tasks/utils/derive-setu-ai-task-status.util';
import { getSetuAiTaskTokenLimits } from 'src/engine/metadata-modules/ai/ai-tasks/utils/get-setu-ai-task-token-limits.util';
import { toSetuAiTaskProjection } from 'src/engine/metadata-modules/ai/ai-tasks/utils/to-setu-ai-task-projection.util';

const crmContext = {
  company: {
    sourceId: 'record:company:acme-id',
    objectNameSingular: 'company',
    recordId: 'acme-id',
    label: 'Acme',
    data: {},
  },
  people: [],
  opportunities: [
    {
      sourceId: 'record:opportunity:deal-id',
      objectNameSingular: 'opportunity',
      recordId: 'deal-id',
      label: 'Acme expansion',
      data: {},
    },
  ],
  notes: [],
  tasks: [],
  unavailableSections: [],
};

describe('deriveSetuAiTaskStatus', () => {
  const derive = (stepStatuses: string[], isCancelRequested = false) =>
    deriveSetuAiTaskStatus({
      stepStatuses: stepStatuses as never,
      isCancelRequested,
    });

  it('reads two finished accounts and one waiting account as waiting for input', () => {
    expect(derive(['completed', 'completed', 'waiting_input'])).toBe(
      'waiting_input',
    );
  });

  it('keeps running while any account is queued or running', () => {
    expect(derive(['queued', 'queued'])).toBe('queued');
    expect(derive(['completed', 'queued'])).toBe('running');
    expect(derive(['waiting_input', 'running'])).toBe('running');
  });

  it('reports a permanent failure next to finished briefs as partial', () => {
    expect(derive(['completed', 'completed', 'failed'])).toBe(
      'partially_completed',
    );
    expect(derive(['completed', 'completed'])).toBe('completed');
    expect(derive(['failed', 'failed'])).toBe('failed');
  });

  it('waits for a running account before calling a cancellation done', () => {
    expect(derive(['completed', 'running', 'cancelled'], true)).toBe(
      'cancel_requested',
    );
    expect(derive(['completed', 'cancelled'], true)).toBe('cancelled');
  });
});

describe('buildSetuAiResearchBrief', () => {
  it('keeps only evidence the run retrieved and counts what it dropped', () => {
    const brief = buildSetuAiResearchBrief({
      output: {
        summary: 'Acme is expanding.',
        sections: [
          {
            heading: 'Signals',
            body: 'Expansion deal is open.',
            evidenceIds: [
              'record:opportunity:deal-id',
              'record:opportunity:invented-id',
              'https://acme.example/news#top',
              'https://not-cited.example/page',
            ],
          },
        ],
        unknowns: ['Budget owner'],
        suggestedNextSteps: ['Ask about timing'],
      },
      crmContext,
      citedUrls: [{ url: 'https://acme.example/news', title: 'Acme news' }],
    });

    expect(brief.sections[0].evidenceIds).toEqual([
      'record:opportunity:deal-id',
      'https://acme.example/news',
    ]);
    expect(brief.removedEvidenceCount).toBe(2);
    expect(brief.evidence.map((evidence) => evidence.kind)).toEqual([
      'record',
      'web',
    ]);
    expect(brief.scope).toBe('crm_and_web');
    expect(brief.savedNoteId).toBeNull();
  });

  it('marks a brief without cited pages as CRM-only', () => {
    const brief = buildSetuAiResearchBrief({
      output: {
        summary: 'Little is known.',
        sections: [],
        unknowns: [],
        suggestedNextSteps: [],
      },
      crmContext,
      citedUrls: [],
    });

    expect(brief.scope).toBe('crm_only');
    expect(buildSetuAiResearchBriefMarkdown(brief)).toContain(
      'Scope: CRM records only',
    );
  });
});

describe('toSetuAiTaskProjection', () => {
  const task = {
    id: 'task-id',
    kind: 'account_research',
    status: 'waiting_input',
    stateVersion: 3,
    request: { focus: null, saveBriefsAsNotes: false },
    cancelRequestedAt: null,
    errorCode: null,
    usage: { totalTokens: 10 },
    tokenLimit: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const step = (overrides: Record<string, unknown>) => ({
    id: 'step-id',
    stepKey: 'company:1',
    position: 0,
    companyId: 'company-id',
    companyName: 'Orbit',
    status: 'waiting_input',
    stateVersion: 2,
    errorCode: null,
    pendingInput: { version: 1, prompt: 'Which website?', fields: [] },
    brief: null,
    completedAt: null,
    checkpoint: { answers: [] },
    ...overrides,
  });

  it('offers an answer for a waiting step and a retry for a failed one, never internals', () => {
    const projection = toSetuAiTaskProjection(
      task as never,
      [
        step({}),
        step({
          id: 'failed-id',
          position: 1,
          status: 'failed',
          pendingInput: null,
        }),
      ] as never,
    );

    expect(projection.allowedOperations).toEqual(['cancel']);
    expect(projection.steps.map((item) => item.allowedOperations)).toEqual([
      ['answer'],
      ['retry'],
    ]);
    expect(JSON.stringify(projection)).not.toContain('checkpoint');
  });

  it('offers nothing once cancellation was requested', () => {
    const projection = toSetuAiTaskProjection(
      {
        ...task,
        status: 'cancel_requested',
        cancelRequestedAt: new Date(),
      } as never,
      [step({ status: 'failed', pendingInput: null })] as never,
    );

    expect(projection.allowedOperations).toEqual([]);
    expect(projection.steps[0].allowedOperations).toEqual([]);
  });
});

describe('getSetuAiTaskTokenLimits', () => {
  it('keeps the defaults when the configured values are malformed', () => {
    const limits = getSetuAiTaskTokenLimits({
      SETU_AI_TASKS_TOKEN_LIMIT_PER_TASK: 'lots',
      SETU_AI_TASKS_WORKSPACE_DAILY_TOKEN_LIMIT: '-1',
    });

    expect(limits.perTask).toBe(600_000);
    expect(limits.perWorkspacePerDay).toBe(3_000_000);
  });

  it('never reserves more for a step than the whole task may use', () => {
    expect(
      getSetuAiTaskTokenLimits({ SETU_AI_TASKS_TOKEN_LIMIT_PER_TASK: '50000' })
        .perStepReservation,
    ).toBe(50_000);
  });
});
