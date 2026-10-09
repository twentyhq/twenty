import { askQuestionInputSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/ask-question.pausing-tool';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';

const QUESTION = {
  header: 'Email type',
  question: 'What type of email?',
  options: [{ label: 'Welcome' }, { label: 'Offer' }],
};

describe('ask_question tool', () => {
  it('drops the obvious-default guidance on workspace setup threads', () => {
    const standardTool = createAskQuestionTool({
      isWorkspaceSetupThread: false,
    });
    const setupTool = createAskQuestionTool({ isWorkspaceSetupThread: true });

    expect(standardTool.description).toContain(
      'trivial choices with an obvious default',
    );
    expect(setupTool.description).not.toContain('obvious default');
    expect(setupTool.description).toContain(
      'information you could look up with another tool',
    );
  });

  it('tells the model to ask several questions as several calls', () => {
    const tool = createAskQuestionTool({ isWorkspaceSetupThread: false });

    expect(tool.description).toContain('call it once per question');
  });

  it('execute echoes the question with a pending status', async () => {
    const tool = createAskQuestionTool({ isWorkspaceSetupThread: false });

    expect(await tool.execute(QUESTION)).toEqual({
      success: true,
      message: expect.any(String),
      result: { question: QUESTION, status: 'pending' },
    });
  });

  it.each([
    ['fewer than two options', { options: [{ label: 'only one' }] }],
    ['a blank option label', { options: [{ label: '  ' }, { label: 'b' }] }],
    [
      'more than four options',
      {
        options: ['a', 'b', 'c', 'd', 'e'].map((label) => ({ label })),
      },
    ],
    [
      'more than one recommended option',
      {
        options: [
          { label: 'a', isRecommended: true },
          { label: 'b', isRecommended: true },
        ],
      },
    ],
  ])('rejects %s', (_case, override) => {
    expect(
      askQuestionInputSchema.safeParse({ ...QUESTION, ...override }).success,
    ).toBe(false);
  });

  it('accepts a multi-select question with a recommended option', () => {
    expect(
      askQuestionInputSchema.safeParse({
        ...QUESTION,
        options: [
          { label: 'c', description: 'desc', isRecommended: true },
          { label: 'd' },
        ],
        allowMultiSelect: true,
      }).success,
    ).toBe(true);
  });
});
