import { type ToolRecordReference } from 'twenty-shared/ai';

import { resolveAiSearchAnswerResponse } from 'src/engine/metadata-modules/ai/ai-search-answer/utils/resolve-ai-search-answer-response.util';

const acme: ToolRecordReference = {
  objectNameSingular: 'company',
  recordId: 'acme-id',
  displayName: 'Acme',
};

const jane: ToolRecordReference = {
  objectNameSingular: 'person',
  recordId: 'jane-id',
  displayName: 'Jane Doe',
};

const sourcesByReference = new Map([
  ['R1', acme],
  ['R2', jane],
]);

describe('resolveAiSearchAnswerResponse', () => {
  it('returns the answer with the cited sources', () => {
    expect(
      resolveAiSearchAnswerResponse({
        output: {
          status: 'answer',
          answer: '  Acme is based in Paris.  ',
          sourceReferences: ['R1', '[r2]', 'R1'],
        },
        sourcesByReference,
      }),
    ).toEqual({
      kind: 'answer',
      text: 'Acme is based in Paris.',
      sources: [acme, jane],
    });
  });

  it('drops references to records the model was not given', () => {
    expect(
      resolveAiSearchAnswerResponse({
        output: {
          status: 'answer',
          answer: 'Acme is based in Paris.',
          sourceReferences: ['R1', 'R9'],
        },
        sourcesByReference,
      }),
    ).toEqual({
      kind: 'answer',
      text: 'Acme is based in Paris.',
      sources: [acme],
    });
  });

  it('hands off an answer that cites none of the provided records', () => {
    expect(
      resolveAiSearchAnswerResponse({
        output: {
          status: 'answer',
          answer: 'Acme has 42 open deals.',
          sourceReferences: ['R7'],
        },
        sourcesByReference,
      }),
    ).toEqual({ kind: 'handoff' });
  });

  it('hands off an empty answer', () => {
    expect(
      resolveAiSearchAnswerResponse({
        output: { status: 'answer', answer: '  ', sourceReferences: ['R1'] },
        sourcesByReference,
      }),
    ).toEqual({ kind: 'handoff' });
  });

  it('passes a handoff through without sources', () => {
    expect(
      resolveAiSearchAnswerResponse({
        output: {
          status: 'handoff',
          answer: 'Ignored text',
          sourceReferences: ['R1'],
        },
        sourcesByReference,
      }),
    ).toEqual({ kind: 'handoff' });
  });
});
