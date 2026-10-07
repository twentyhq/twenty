import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { stampPendingToolPartsAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-history/utils/stamp-pending-tool-parts-awaited-by-caller.util';

const toolPart = (status: string) =>
  ({
    type: 'tool-ask_question',
    toolCallId: `call-${status}`,
    state: 'output-available',
    input: {},
    output: { result: { status } },
  }) as unknown as ExtendedUIMessagePart;

describe('stampPendingToolPartsAwaitedByCaller', () => {
  it('marks pending calls only', () => {
    const textPart = { type: 'text', text: 'Hello' } as ExtendedUIMessagePart;

    expect(
      stampPendingToolPartsAwaitedByCaller([
        textPart,
        toolPart('pending'),
        toolPart('answered'),
      ]),
    ).toEqual([
      textPart,
      {
        ...toolPart('pending'),
        output: { result: { status: 'pending' }, awaitedByCaller: true },
      },
      toolPart('answered'),
    ]);
  });
});
