import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { buildEvaluationQuestions } from 'src/modules/workflow/workflow-executor/workflow-actions/classify/utils/build-evaluation-questions.util';

describe('buildEvaluationQuestions', () => {
  it('rejects a resolved choice label containing a variable path separator', () => {
    expect(() =>
      buildEvaluationQuestions([
        {
          id: 'question',
          name: 'profession',
          type: 'choice',
          instructions: 'Choose a profession',
          criteria: [{ id: 'option', name: 'Dr. Lawyer' }],
        },
      ]),
    ).toThrow('separates a variable path');
  });

  it('should key answers by question name', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'intent',
          type: 'choice',
          instructions: 'What does the message ask for?',
          criteria: [
            { id: 'c1', name: 'pricing', description: 'Asks about price' },
            { id: 'c2', name: 'support' },
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
            { id: 'c1', name: 'Low', description: 'Can wait a week' },
            { id: 'c2', name: 'High' },
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

  // The editor seeds every added level with description: '', so this is the
  // shape the UI actually sends, not an omitted field.
  it('should fall back to the level label when the editor left the description empty', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'urgency',
          type: 'score',
          instructions: 'How urgent?',
          criteria: [
            { id: 'c1', name: 'Low', description: '' },
            { id: 'c2', name: 'High', description: '' },
          ],
        },
      ]),
    ).toEqual({
      urgency: {
        type: 'score',
        instructions: 'How urgent?',
        criteria: ['Low', 'High'],
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
          criteria: [{ id: 'c1', name: 'ignored' }],
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

  // Options key a map, so a repeat would hand the model fewer choices than the
  // step declares rather than failing.
  it('should refuse a choice question listing the same option twice', () => {
    expect(() =>
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'intent',
          type: 'choice',
          instructions: 'What does it ask for?',
          criteria: [
            { id: 'c1', name: 'pricing', description: 'First' },
            { id: 'c2', name: 'support' },
            { id: 'c3', name: 'pricing', description: 'Second' },
          ],
        },
      ]),
    ).toThrow(
      expect.objectContaining({
        code: AiExceptionCode.INVALID_EVALUATION_REQUEST,
      }),
    );
  });

  // Score levels are positional and keep their count, so a repeated label
  // loses nothing.
  it('should allow a score question repeating a level label', () => {
    expect(
      buildEvaluationQuestions([
        {
          id: '4ef0a3b8-1f4a-4b3e-9c2d-2a1f5b6c7d8e',
          name: 'urgency',
          type: 'score',
          instructions: 'How urgent?',
          criteria: [
            { id: 'c1', name: 'Same', description: 'Low' },
            { id: 'c2', name: 'Same', description: 'High' },
          ],
        },
      ]),
    ).toEqual({
      urgency: {
        type: 'score',
        instructions: 'How urgent?',
        criteria: ['Low', 'High'],
      },
    });
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
