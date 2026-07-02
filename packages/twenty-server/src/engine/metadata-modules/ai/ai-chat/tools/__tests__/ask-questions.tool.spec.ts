import {
  ASK_QUESTIONS_TOOL_NAME,
  askQuestionsInputSchema,
  createAskQuestionsTool,
} from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-questions.tool';

describe('ask_questions tool', () => {
  it('is named ask_questions (plural)', () => {
    expect(ASK_QUESTIONS_TOOL_NAME).toBe('ask_questions');
  });

  it('execute echoes the questions with a pending status', async () => {
    const tool = createAskQuestionsTool();
    const questions = [
      {
        header: 'Email type',
        question: 'What type of email?',
        options: [{ label: 'Welcome' }, { label: 'Offer' }],
      },
    ];

    const output = await tool.execute({ questions });

    expect(output).toEqual({
      success: true,
      message: expect.any(String),
      result: { questions, status: 'pending' },
    });
  });

  it('rejects fewer than two options', () => {
    const result = askQuestionsInputSchema.safeParse({
      questions: [
        { header: 'h', question: 'q', options: [{ label: 'only one' }] },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects zero questions', () => {
    const result = askQuestionsInputSchema.safeParse({ questions: [] });

    expect(result.success).toBe(false);
  });

  it('rejects more than four questions', () => {
    const question = {
      header: 'h',
      question: 'q',
      options: [{ label: 'a' }, { label: 'b' }],
    };
    const result = askQuestionsInputSchema.safeParse({
      questions: [question, question, question, question, question],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than four options', () => {
    const result = askQuestionsInputSchema.safeParse({
      questions: [
        {
          header: 'h',
          question: 'q',
          options: [
            { label: 'a' },
            { label: 'b' },
            { label: 'c' },
            { label: 'd' },
            { label: 'e' },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('rejects more than one recommended option', () => {
    const result = askQuestionsInputSchema.safeParse({
      questions: [
        {
          header: 'h',
          question: 'q',
          options: [
            { label: 'a', isRecommended: true },
            { label: 'b', isRecommended: true },
          ],
        },
      ],
    });

    expect(result.success).toBe(false);
  });

  it('accepts a valid multi-question payload', () => {
    const result = askQuestionsInputSchema.safeParse({
      questions: [
        {
          header: 'h1',
          question: 'q1',
          options: [{ label: 'a' }, { label: 'b' }],
        },
        {
          header: 'h2',
          question: 'q2',
          options: [
            { label: 'c', description: 'desc', isRecommended: true },
            { label: 'd' },
          ],
          allowMultiSelect: true,
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});
