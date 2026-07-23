import { type StepResult, type ToolSet } from 'ai';

import {
  buildToolCallHistoryFromSteps,
  buildToolCallSignature,
  createRepeatedToolCallGuardState,
  evaluateRepeatedToolCallGuard,
  type RepeatedToolCallGuardState,
  type ToolCallHistoryEntry,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/repeated-tool-call-guard.util';

const buildEntry = (
  stepIndex: number,
  signature: string,
  toolName = 'tool_a',
): ToolCallHistoryEntry => ({ stepIndex, toolName, signature });

const buildStep = (
  toolCalls: Array<{ toolName: string; input: unknown }>,
): StepResult<ToolSet> => ({ toolCalls }) as unknown as StepResult<ToolSet>;

describe('buildToolCallSignature', () => {
  it('produces the same signature regardless of input key order', () => {
    const first = buildToolCallSignature('search_records', {
      objectName: 'company',
      filter: { name: 'Acme', city: 'Paris' },
    });
    const second = buildToolCallSignature('search_records', {
      filter: { city: 'Paris', name: 'Acme' },
      objectName: 'company',
    });

    expect(first).toBe(second);
  });

  it('produces different signatures for different input values', () => {
    expect(
      buildToolCallSignature('search_records', { objectName: 'company' }),
    ).not.toBe(
      buildToolCallSignature('search_records', { objectName: 'person' }),
    );
  });

  it('produces different signatures for different tool names', () => {
    expect(buildToolCallSignature('tool_a', { value: 1 })).not.toBe(
      buildToolCallSignature('tool_b', { value: 1 }),
    );
  });

  it('keeps array order significant', () => {
    expect(buildToolCallSignature('tool_a', { ids: [1, 2] })).not.toBe(
      buildToolCallSignature('tool_a', { ids: [2, 1] }),
    );
  });

  it('canonicalizes nested objects inside arrays', () => {
    const first = buildToolCallSignature('tool_a', {
      items: [{ leftKey: 1, rightKey: 2 }],
    });
    const second = buildToolCallSignature('tool_a', {
      items: [{ rightKey: 2, leftKey: 1 }],
    });

    expect(first).toBe(second);
  });

  it('handles undefined and null inputs', () => {
    expect(buildToolCallSignature('tool_a', undefined)).toBe(
      'tool_a:undefined',
    );
    expect(buildToolCallSignature('tool_a', null)).toBe('tool_a:null');
  });
});

describe('buildToolCallHistoryFromSteps', () => {
  it('flattens tool calls across steps with their step index', () => {
    const history = buildToolCallHistoryFromSteps([
      buildStep([
        { toolName: 'tool_a', input: { value: 1 } },
        { toolName: 'tool_b', input: { value: 2 } },
      ]),
      buildStep([{ toolName: 'tool_a', input: { value: 1 } }]),
    ]);

    expect(history).toHaveLength(3);
    expect(history[0].stepIndex).toBe(0);
    expect(history[1].stepIndex).toBe(0);
    expect(history[2].stepIndex).toBe(1);
    expect(history[0].signature).toBe(history[2].signature);
  });

  it('resolves the inner tool name for execute_tool calls', () => {
    const history = buildToolCallHistoryFromSteps([
      buildStep([
        {
          toolName: 'execute_tool',
          input: { toolName: 'get_workflow_current_version', input: {} },
        },
      ]),
    ]);

    expect(history[0].toolName).toBe('get_workflow_current_version');
    expect(history[0].signature).toContain('execute_tool');
  });
});

describe('evaluateRepeatedToolCallGuard', () => {
  const evaluate = (
    toolCallHistory: ToolCallHistoryEntry[],
    previousState: RepeatedToolCallGuardState = createRepeatedToolCallGuardState(),
  ) => evaluateRepeatedToolCallGuard({ toolCallHistory, previousState });

  it('stays ok when calls are varied', () => {
    const state = evaluate([
      buildEntry(0, 'a'),
      buildEntry(1, 'b'),
      buildEntry(2, 'c'),
      buildEntry(3, 'a'),
    ]);

    expect(state.status).toBe('ok');
  });

  it('stays ok on only two identical consecutive calls', () => {
    const state = evaluate([buildEntry(0, 'a'), buildEntry(1, 'a')]);

    expect(state.status).toBe('ok');
  });

  it('warns after three identical consecutive calls', () => {
    const state = evaluate([
      buildEntry(0, 'a', 'search_records'),
      buildEntry(1, 'a', 'search_records'),
      buildEntry(2, 'a', 'search_records'),
    ]);

    expect(state.status).toBe('warned');
    expect(state.repeatedSignature).toBe('a');
    expect(state.repeatedToolName).toBe('search_records');
    expect(state.callCountAtWarning).toBe(3);
  });

  it('warns on three identical consecutive calls within a single step', () => {
    const state = evaluate([
      buildEntry(0, 'a'),
      buildEntry(0, 'a'),
      buildEntry(0, 'a'),
    ]);

    expect(state.status).toBe('warned');
  });

  it('warns when a signature occurs more than five times within the last ten steps', () => {
    const toolCallHistory = Array.from({ length: 6 }, (_, index) => [
      buildEntry(index, 'a'),
      buildEntry(index, `other-${index}`),
    ]).flat();

    const state = evaluate(toolCallHistory);

    expect(state.status).toBe('warned');
    expect(state.repeatedSignature).toBe('a');
  });

  it('stays ok at exactly five occurrences within the last ten steps', () => {
    const toolCallHistory = Array.from({ length: 5 }, (_, index) => [
      buildEntry(index, 'a'),
      buildEntry(index, `other-${index}`),
    ]).flat();

    const state = evaluate(toolCallHistory);

    expect(state.status).toBe('ok');
  });

  it('ignores occurrences older than the ten step window', () => {
    // Six occurrences of "a" overall, but only three fall within the last
    // ten steps and none are consecutive.
    const toolCallHistory = [
      buildEntry(0, 'a'),
      buildEntry(0, 'x'),
      buildEntry(1, 'a'),
      buildEntry(1, 'y'),
      buildEntry(2, 'a'),
      buildEntry(5, 'z'),
      buildEntry(11, 'a'),
      buildEntry(11, 'x'),
      buildEntry(12, 'a'),
      buildEntry(12, 'y'),
      buildEntry(13, 'a'),
    ];

    expect(evaluate(toolCallHistory).status).toBe('ok');
  });

  it('escalates to stopped when the warned call is repeated after the warning', () => {
    const warnedState = evaluate([
      buildEntry(0, 'a'),
      buildEntry(1, 'a'),
      buildEntry(2, 'a'),
    ]);

    const state = evaluate(
      [
        buildEntry(0, 'a'),
        buildEntry(1, 'a'),
        buildEntry(2, 'a'),
        buildEntry(3, 'a'),
      ],
      warnedState,
    );

    expect(state.status).toBe('stopped');
    expect(state.repeatedSignature).toBe('a');
  });

  it('stays warned when different calls follow the warning', () => {
    const warnedState = evaluate([
      buildEntry(0, 'a'),
      buildEntry(1, 'a'),
      buildEntry(2, 'a'),
    ]);

    const state = evaluate(
      [
        buildEntry(0, 'a'),
        buildEntry(1, 'a'),
        buildEntry(2, 'a'),
        buildEntry(3, 'b'),
        buildEntry(4, 'c'),
      ],
      warnedState,
    );

    expect(state.status).toBe('warned');
    expect(state).toBe(warnedState);
  });

  it('re-warns for a different call that starts looping after the warning', () => {
    const warnedState = evaluate([
      buildEntry(0, 'a'),
      buildEntry(1, 'a'),
      buildEntry(2, 'a'),
    ]);

    const state = evaluate(
      [
        buildEntry(0, 'a'),
        buildEntry(1, 'a'),
        buildEntry(2, 'a'),
        buildEntry(3, 'b', 'tool_b'),
        buildEntry(4, 'b', 'tool_b'),
        buildEntry(5, 'b', 'tool_b'),
      ],
      warnedState,
    );

    expect(state.status).toBe('warned');
    expect(state.repeatedSignature).toBe('b');
    expect(state.repeatedToolName).toBe('tool_b');
    expect(state.callCountAtWarning).toBe(6);
  });

  it('does not re-trip the warned run itself on later evaluations', () => {
    const warnedState = evaluate([
      buildEntry(0, 'a'),
      buildEntry(1, 'a'),
      buildEntry(2, 'a'),
    ]);

    const state = evaluate(
      [
        buildEntry(0, 'a'),
        buildEntry(1, 'a'),
        buildEntry(2, 'a'),
        buildEntry(3, 'b'),
      ],
      warnedState,
    );

    expect(state.status).toBe('warned');
    expect(state.repeatedSignature).toBe('a');
    expect(state.callCountAtWarning).toBe(3);
  });

  it('keeps stopped as a terminal state', () => {
    const stoppedState: RepeatedToolCallGuardState = {
      status: 'stopped',
      repeatedToolName: 'tool_a',
      repeatedSignature: 'a',
      callCountAtWarning: 3,
    };

    const state = evaluate(
      [buildEntry(0, 'b'), buildEntry(1, 'c')],
      stoppedState,
    );

    expect(state).toBe(stoppedState);
  });
});
