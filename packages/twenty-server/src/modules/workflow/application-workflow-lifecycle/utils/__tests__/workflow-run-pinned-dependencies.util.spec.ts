import { LogicFunctionRuntime } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { computeWorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-workflow-run-pinned-dependencies.util';
import { hasPinnedDependencyChanged } from 'src/modules/workflow/application-workflow-lifecycle/utils/has-pinned-dependency-changed.util';

type PinnedDependencyRows = Parameters<
  typeof computeWorkflowRunPinnedDependencies
>[0];

const greet: PinnedDependencyRows['logicFunctions'][number] = {
  id: 'greet-id',
  checksum: 'checksum-1',
  handlerName: 'main',
  runtime: LogicFunctionRuntime.NODE22,
  workflowActionTriggerSettings: {},
};

const summarizer: PinnedDependencyRows['agents'][number] = {
  id: 'summarizer-id',
  prompt: 'You summarize',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
};

const pinnedDependencies = computeWorkflowRunPinnedDependencies({
  logicFunctions: [greet],
  agents: [summarizer],
});

const dependencies = {
  logicFunctionIds: ['greet-id'],
  agentIds: ['summarizer-id'],
};

describe('workflow run pinned dependencies', () => {
  it('pins every function and agent it is given by id', () => {
    expect(
      Object.keys(pinnedDependencies.logicFunctionFingerprintById),
    ).toEqual(['greet-id']);
    expect(Object.keys(pinnedDependencies.agentFingerprintById)).toEqual([
      'summarizer-id',
    ]);
  });

  it('accepts definitions that did not change', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies,
        currentDependencies: computeWorkflowRunPinnedDependencies({
          logicFunctions: [greet],
          agents: [summarizer],
        }),
      }),
    ).toBe(false);
  });

  it('rejects a function rebuilt after the run started', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies,
        currentDependencies: computeWorkflowRunPinnedDependencies({
          logicFunctions: [{ ...greet, checksum: 'checksum-2' }],
          agents: [summarizer],
        }),
      }),
    ).toBe(true);
  });

  it('rejects a removed function', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies,
        currentDependencies: computeWorkflowRunPinnedDependencies({
          logicFunctions: [],
          agents: [summarizer],
        }),
      }),
    ).toBe(true);
  });

  it('rejects an agent whose prompt changed', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies,
        currentDependencies: computeWorkflowRunPinnedDependencies({
          logicFunctions: [greet],
          agents: [{ ...summarizer, prompt: 'You translate' }],
        }),
      }),
    ).toBe(true);
  });

  it('rejects a dependency that was not pinned when the run started', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies,
        pinnedDependencies: {
          logicFunctionFingerprintById: {},
          agentFingerprintById: {},
        },
        currentDependencies: pinnedDependencies,
      }),
    ).toBe(true);
  });

  it('ignores dependencies the step does not use', () => {
    expect(
      hasPinnedDependencyChanged({
        dependencies: { logicFunctionIds: [], agentIds: [] },
        pinnedDependencies,
        currentDependencies: computeWorkflowRunPinnedDependencies({
          logicFunctions: [],
          agents: [],
        }),
      }),
    ).toBe(false);
  });
});
