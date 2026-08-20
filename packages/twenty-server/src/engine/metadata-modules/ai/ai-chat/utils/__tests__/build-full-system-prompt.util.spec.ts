import { buildFullSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-full-system-prompt.util';

const WORKSPACE_INSTRUCTIONS_DOCUMENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Always answer in bullet points.' }],
    },
  ],
});

const USER_CONTEXT = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  jobTitle: 'COO',
  locale: 'fr-FR',
  timezone: 'Europe/Paris',
};

const buildPrompt = (isWorkspaceSetupThread?: boolean) =>
  buildFullSystemPrompt({
    toolCatalog: [],
    skillCatalog: [],
    preloadedTools: [],
    workspaceInstructions: WORKSPACE_INSTRUCTIONS_DOCUMENT,
    userContext: USER_CONTEXT,
    isWorkspaceSetupThread,
  });

describe('buildFullSystemPrompt', () => {
  it('should keep the standard composition for regular threads', () => {
    const prompt = buildPrompt(false);

    expect(prompt).toContain(
      'You are a helpful AI assistant integrated into Twenty',
    );
    expect(prompt).toContain('A <browsing_context> tag may appear');
    expect(prompt).toContain('## Workspace Instructions');
    expect(prompt).toContain('Always answer in bullet points.');
    expect(prompt).toContain('Record References - IMPORTANT');
    expect(prompt).toContain('## User Context');
    expect(prompt).not.toContain(
      'kicking off the setup of this brand-new workspace',
    );
  });

  it('should swap in the workspace setup prompt for setup threads', () => {
    const prompt = buildPrompt(true);

    expect(prompt).toContain(
      'kicking off the setup of this brand-new workspace',
    );
    expect(prompt).toContain('## How every reply ends');
    expect(prompt).toContain('Record References - IMPORTANT');
    expect(prompt).toContain('## User Context');
    expect(prompt).toContain('Job title: COO');
    expect(prompt).not.toContain(
      'You are a helpful AI assistant integrated into Twenty',
    );
    expect(prompt).not.toContain('A <browsing_context> tag may appear');
  });

  it('should ignore workspace instructions on setup threads', () => {
    const prompt = buildPrompt(true);

    expect(prompt).not.toContain('## Workspace Instructions');
    expect(prompt).not.toContain('Always answer in bullet points.');
  });
});
