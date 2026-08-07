import { SystemPromptBuilderService } from 'src/engine/metadata-modules/ai/ai-chat/services/system-prompt-builder.service';

describe('SystemPromptBuilderService', () => {
  const buildService = () =>
    new SystemPromptBuilderService({} as never, {} as never, {} as never);

  describe('buildUserContextSection', () => {
    it('omits the timezone line when timezone is the "system" sentinel', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        locale: 'en',
        timezone: 'system',
      });

      expect(result).not.toContain('Timezone:');
      expect(result).toContain('Current date:');
    });

    it('omits the job title line when the workspace member has none', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: '',
        locale: 'en',
        timezone: 'system',
      });

      expect(result).not.toContain('Job title:');
    });

    it('includes the job title line when the workspace member has one', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: 'Head of Marketing',
        locale: 'en',
        timezone: 'system',
      });

      expect(result).toContain('Job title: Head of Marketing');
    });

    it('includes the timezone line for a valid IANA timezone', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        jobTitle: null,
        locale: 'en',
        timezone: 'America/New_York',
      });

      expect(result).toContain('Timezone: America/New_York');
      expect(result).toContain('Current date:');
    });
  });

  describe('buildFullPrompt', () => {
    it('does not append a trailing blank line when the skill catalog is empty', () => {
      const result = buildService().buildFullPrompt([], [], []);

      expect(result.endsWith('\n')).toBe(false);
    });
  });

  describe('buildWorkspaceInstructionsSection', () => {
    it('projects canonical TipTap JSON to Markdown', () => {
      const result = buildService().buildWorkspaceInstructionsSection(
        JSON.stringify({
          type: 'doc',
          attrs: { schemaVersion: 1 },
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Sales rules' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Be concise.' }],
            },
          ],
        }),
      );

      expect(result).toContain('## Sales rules\n\nBe concise.');
      expect(result).not.toContain('"type":"doc"');
    });

    it('omits an empty canonical document', () => {
      expect(
        buildService().buildWorkspaceInstructionsSection(
          JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 } }),
        ),
      ).toBe('');
    });
  });
});
