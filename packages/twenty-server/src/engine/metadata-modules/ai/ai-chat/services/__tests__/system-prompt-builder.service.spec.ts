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
        locale: 'en',
        timezone: 'system',
      });

      expect(result).not.toContain('Timezone:');
      expect(result).toContain('Current date:');
    });

    it('includes the timezone line for a valid IANA timezone', () => {
      const service = buildService();

      const result = service.buildUserContextSection({
        firstName: 'John',
        lastName: 'Doe',
        locale: 'en',
        timezone: 'America/New_York',
      });

      expect(result).toContain('Timezone: America/New_York');
      expect(result).toContain('Current date:');
    });
  });
});
