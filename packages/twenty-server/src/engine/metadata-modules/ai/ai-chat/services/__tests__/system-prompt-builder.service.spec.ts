import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';
import { type SkillService } from 'src/engine/metadata-modules/skill/skill.service';

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

describe('SystemPromptBuilderService.buildFullPrompt', () => {
  const service = new SystemPromptBuilderService(
    {} as ToolRegistryService,
    {} as SkillService,
    {} as AgentActorContextService,
  );

  const buildPrompt = (isWorkspaceSetupThread?: boolean) =>
    service.buildFullPrompt({
      toolCatalog: [],
      skillCatalog: [],
      preloadedTools: [],
      workspaceInstructions: WORKSPACE_INSTRUCTIONS_DOCUMENT,
      userContext: USER_CONTEXT,
      isWorkspaceSetupThread,
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

  it('should ignore workspace instructions on setup threads', () => {
    const prompt = buildPrompt(true);

    expect(prompt).not.toContain('## Workspace Instructions');
    expect(prompt).not.toContain('Always answer in bullet points.');
  });
});
