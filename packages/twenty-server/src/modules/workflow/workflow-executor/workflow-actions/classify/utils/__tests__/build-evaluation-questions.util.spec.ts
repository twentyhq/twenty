import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { buildEvaluationQuestions } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/utils/build-evaluation-questions.util';

describe('buildEvaluationQuestions', () => {
  it('should key answers by question name', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'intent',
          type: 'choice',
          instructions: 'What does the message ask for?',
          criteria: [
            { name: 'pricing', description: 'Asks about price' },
            { name: 'support' },
          ],
        },
      ]),
    ).toEqual({
      intent: {
        type: 'choice',
        instructions: 'What does the message ask for?',
        criteria: { pricing: 'Asks about price', support: null },
      },
    });
  });

  it('should order score levels as the editor lists them', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'urgency',
          type: 'score',
          instructions: 'How urgent?',
          criteria: [
            { name: 'Low', description: 'Can wait a week' },
            { name: 'High' },
          ],
        },
      ]),
    ).toEqual({
      urgency: {
        type: 'score',
        instructions: 'How urgent?',
        // The second level has no description, so its label stands in.
        criteria: ['Can wait a week', 'High'],
      },
    });
  });

  it('should drop criteria on a boolean question', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'isSpam',
          type: 'boolean',
          instructions: 'Is this spam?',
          criteria: [{ name: 'ignored' }],
        },
      ]),
    ).toEqual({
      isSpam: { type: 'boolean', instructions: 'Is this spam?' },
    });
  });

  it('should refuse two questions sharing a name', () => {
    expect(() =>
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'intent',
          type: 'boolean',
          instructions: 'Is this spam?',
          criteria: [],
        },
        {
          id: '5ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'intent',
          type: 'boolean',
          instructions: 'Is this urgent?',
          criteria: [],
        },
      ]),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_EVALUATION_REQUEST,
      }),
    );
  });

  it('should refuse an unnamed question', () => {
    expect(() =>
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: '',
          type: 'boolean',
          instructions: 'Is this spam?',
          criteria: [],
        },
      ]),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_EVALUATION_REQUEST,
      }),
    );
  });
});
