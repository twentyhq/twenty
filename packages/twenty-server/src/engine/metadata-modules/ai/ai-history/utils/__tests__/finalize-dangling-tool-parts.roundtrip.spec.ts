import { convertToModelMessages, type UIMessage } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { finalizeDanglingToolParts } from 'src/engine/metadata-modules/ai/ai-history/utils/finalize-dangling-tool-parts.util';
import { mapDBPartToUIMessagePart } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';

const pendingToolPart = (
  state: 'input-available' | 'input-streaming',
  toolCallId: string,
): ExtendedUIMessagePart => ({
  type: 'tool-execute_tool',
  input: { name: 'nav item' },
  state,
  toolCallId,
});

const persistAndReload = (
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessagePart[] =>
  mapUIMessagePartsToDBParts(parts, 'message-1')
    .map((dbPart) =>
      mapDBPartToUIMessagePart(dbPart as AgentMessagePartWorkspaceEntity),
    )
    .filter((part): part is ExtendedUIMessagePart => part !== null);

const buildThread = (assistantParts: ExtendedUIMessagePart[]): UIMessage[] => [
  {
    id: 'u1',
    role: 'user',
    parts: [{ type: 'text', text: 'create 3 items' }],
  },
  { id: 'a1', role: 'assistant', parts: assistantParts },
  {
    id: 'u2',
    role: 'user',
    parts: [{ type: 'text', text: 'now revert them' }],
  },
];

const unresolvedToolCallIds = async (
  messages: UIMessage[],
): Promise<string[]> => {
  const modelMessages = await convertToModelMessages(messages);
  const pending = new Set<string>();

  for (const message of modelMessages) {
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const content of message.content) {
      if (typeof content !== 'object') {
        continue;
      }

      if (content.type === 'tool-call' && content.providerExecuted !== true) {
        pending.add(content.toolCallId);
      }

      if (content.type === 'tool-result') {
        pending.delete(content.toolCallId);
      }
    }
  }

  return [...pending];
};

// convertToModelMessages drops a nullish `input`, so every reconstructed tool-call must carry one
const toolCallInputs = async (messages: UIMessage[]): Promise<unknown[]> => {
  const modelMessages = await convertToModelMessages(messages);
  const inputs: unknown[] = [];

  for (const message of modelMessages) {
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const content of message.content) {
      if (typeof content === 'object' && content.type === 'tool-call') {
        inputs.push(content.input);
      }
    }
  }

  return inputs;
};

describe('finalizeDanglingToolParts round-trip', () => {
  const interruptedBatch: ExtendedUIMessagePart[] = [
    { type: 'text', text: 'Creating items…' } as ExtendedUIMessagePart,
    {
      type: 'tool-execute_tool',
      input: { name: 'nav item' },
      state: 'output-available',
      toolCallId: 'done_1',
      output: { success: true },
    },
    pendingToolPart('input-available', 'pending_1'),
    pendingToolPart('input-available', 'pending_2'),
    pendingToolPart('input-streaming', 'streaming_1'),
  ];

  it('reproduces the bug: input-available calls are left unresolved (input-streaming is not)', async () => {
    expect(await unresolvedToolCallIds(buildThread(interruptedBatch))).toEqual([
      'pending_1',
      'pending_2',
    ]);
  });

  it('resolves every tool call after finalize + persistence round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts(interruptedBatch),
    );

    expect(await unresolvedToolCallIds(buildThread(reloaded))).toEqual([]);
  });

  it('drops the input-streaming part through the round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts(interruptedBatch),
    );

    expect(
      reloaded.some(
        (part) =>
          (part as { toolCallId?: string }).toolCallId === 'streaming_1',
      ),
    ).toBe(false);
  });

  it('preserves the completed tool result through the round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts(interruptedBatch),
    );
    const toolResults = (await convertToModelMessages(buildThread(reloaded)))
      .filter((message) => message.role === 'tool')
      .flatMap((message) =>
        Array.isArray(message.content) ? message.content : [],
      );

    expect(toolResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toolCallId: 'done_1',
          output: expect.objectContaining({ value: { success: true } }),
        }),
      ]),
    );
  });

  // failed input validation: persisted as output-error with a null input (#21695)
  const validationErroredPart: ExtendedUIMessagePart = {
    type: 'tool-execute_tool',
    toolCallId: 'validation_failed_1',
    state: 'output-error',
    input: undefined,
    errorText: 'Invalid input for tool execute_tool: Type validation failed',
  };

  it('replays a validation-errored tool part with a defined input', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts([validationErroredPart]),
    );

    const inputs = await toolCallInputs(buildThread(reloaded));

    expect(inputs).toHaveLength(1);
    expect(inputs[0]).toBeDefined();
    expect(inputs[0]).toEqual({});
  });

  it('keeps a validation-errored tool call resolved after the round-trip', async () => {
    const reloaded = persistAndReload(
      finalizeDanglingToolParts([validationErroredPart]),
    );

    expect(await unresolvedToolCallIds(buildThread(reloaded))).toEqual([]);
  });

  it('persists an empty object rather than null for a missing tool input', () => {
    const [dbPart] = mapUIMessagePartsToDBParts(
      finalizeDanglingToolParts([validationErroredPart]),
      'message-1',
    );

    expect(dbPart.toolInput).toEqual({});
  });
});
