import { WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-alternative-system-prompt.constant';
import { WORKSPACE_SETUP_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-system-prompt.constant';
import { buildFullSystemPrompt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-full-system-prompt.util';
import { type ReferencedSkill } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-referenced-skills-section.util';

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

const EVEN_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea410';
const ODD_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildPrompt = (
  isWorkspaceSetupThread?: boolean,
  workspaceId = EVEN_WORKSPACE_ID,
) =>
  buildFullSystemPrompt({
    toolCatalog: [],
    skillCatalog: [],
    preloadedTools: [],
    workspaceInstructions: WORKSPACE_INSTRUCTIONS_DOCUMENT,
    userContext: USER_CONTEXT,
    workspaceId,
    isWorkspaceSetupThread,
  });

const REFERENCED_SKILL: ReferencedSkill = {
  name: 'workflow-building',
  label: 'Workflow building',
  content: JSON.stringify({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Always create a trigger first.' }],
      },
    ],
  }),
};

describe('buildFullSystemPrompt', () => {
  it('should inline referenced skills after the skill catalog', () => {
    const prompt = buildFullSystemPrompt({
      toolCatalog: [],
      skillCatalog: [],
      referencedSkills: [REFERENCED_SKILL],
      preloadedTools: [],
      workspaceId: EVEN_WORKSPACE_ID,
    });

    expect(prompt).toContain('## Referenced Skills (already loaded)');
    expect(prompt).toContain('Always create a trigger first.');
  });

  it('should omit the referenced skills section when nothing is referenced', () => {
    expect(buildPrompt(false)).not.toContain('## Referenced Skills');
  });

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

  it('should pick the setup prompt variant from the workspace id', () => {
    expect(buildPrompt(true, EVEN_WORKSPACE_ID)).toContain(
      WORKSPACE_SETUP_SYSTEM_PROMPT,
    );
    expect(buildPrompt(true, ODD_WORKSPACE_ID)).toContain(
      WORKSPACE_SETUP_ALTERNATIVE_SYSTEM_PROMPT,
    );
  });

  it('should ignore workspace instructions on setup threads', () => {
    const prompt = buildPrompt(true);

    expect(prompt).not.toContain('## Workspace Instructions');
    expect(prompt).not.toContain('Always answer in bullet points.');
  });

  it('should explain attaching the conversation to records only where the tool is offered', () => {
    const buildPromptWithAttachment = (
      canAttachConversationToRecords: boolean,
    ) =>
      buildFullSystemPrompt({
        toolCatalog: [],
        skillCatalog: [],
        preloadedTools: [],
        workspaceId: EVEN_WORKSPACE_ID,
        canAttachConversationToRecords,
      });

    expect(buildPromptWithAttachment(true)).toContain(
      '## Attaching this conversation to records',
    );
    expect(buildPromptWithAttachment(false)).not.toContain(
      'attach_conversation_to_record',
    );
    expect(buildPrompt(false)).not.toContain('attach_conversation_to_record');
  });
});
