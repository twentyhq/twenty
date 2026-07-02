import { workspaceHasEnabledModels } from 'src/engine/metadata-modules/ai/ai-models/utils/workspace-has-enabled-models.util';

describe('workspaceHasEnabledModels', () => {
  describe('when the workspace uses recommended models', () => {
    it('returns true when at least one model is recommended', () => {
      expect(
        workspaceHasEnabledModels(
          { useRecommendedModels: true, enabledAiModelIds: [] },
          new Set(['openai/gpt-5.2']),
        ),
      ).toBe(true);
    });

    it('returns false when no model is recommended', () => {
      expect(
        workspaceHasEnabledModels(
          { useRecommendedModels: true, enabledAiModelIds: [] },
          new Set(),
        ),
      ).toBe(false);
    });

    it('returns false when no recommended ids are provided', () => {
      expect(
        workspaceHasEnabledModels({
          useRecommendedModels: true,
          enabledAiModelIds: [],
        }),
      ).toBe(false);
    });
  });

  describe('when the workspace selects models manually', () => {
    it('returns true when at least one model is enabled', () => {
      expect(
        workspaceHasEnabledModels({
          useRecommendedModels: false,
          enabledAiModelIds: ['openai/gpt-5.2'],
        }),
      ).toBe(true);
    });

    it('returns false when every model is disabled', () => {
      expect(
        workspaceHasEnabledModels({
          useRecommendedModels: false,
          enabledAiModelIds: [],
        }),
      ).toBe(false);
    });
  });
});
