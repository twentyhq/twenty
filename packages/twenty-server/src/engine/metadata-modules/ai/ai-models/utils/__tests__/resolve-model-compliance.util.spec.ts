import { aiProviderConfigSchema } from 'src/engine/metadata-modules/ai/ai-models/types/ai-provider-config.schema';
import { resolveModelCompliance } from 'src/engine/metadata-modules/ai/ai-models/utils/resolve-model-compliance.util';

describe('resolveModelCompliance', () => {
  it('should fall back to the provider residency when the model declares none', () => {
    expect(
      resolveModelCompliance({}, { dataResidency: 'us' }).dataResidency,
    ).toBe('us');
  });

  it('should let a model override the residency of the credential it shares', () => {
    // One Bedrock entry pinned to eu-west-3 serves both eu.* inference
    // profiles, which stay in the EU, and global.* ones, which do not. The
    // provider label is right for the first and wrong for the second.
    expect(
      resolveModelCompliance({}, { dataResidency: 'eu' }).dataResidency,
    ).toBe('eu');
    expect(
      resolveModelCompliance(
        { dataResidency: 'global' },
        {
          dataResidency: 'eu',
        },
      ).dataResidency,
    ).toBe('global');
  });

  it('should leave residency undefined when neither level declares one', () => {
    expect(resolveModelCompliance({}, {}).dataResidency).toBeUndefined();
  });

  it('should read retention from the model alone', () => {
    expect(resolveModelCompliance({}, {}).zeroDataRetention).toBeUndefined();
    expect(
      resolveModelCompliance({ zeroDataRetention: true }, {}).zeroDataRetention,
    ).toBe(true);
  });

  it('should drop a retention claim written at the provider level', () => {
    // Retention has no provider fallback to reach, because the provider schema
    // does not carry the field: a claim written one level too high is stripped
    // rather than inherited by every model beneath it.
    const parsed = aiProviderConfigSchema.parse({
      npm: '@ai-sdk/anthropic',
      apiKey: 'key',
      dataResidency: 'eu',
      zeroDataRetention: true,
      models: [{ name: 'claude-sonnet-5', label: 'Sonnet 5' }],
    });

    expect(parsed).not.toHaveProperty('zeroDataRetention');
    expect(parsed.dataResidency).toBe('eu');
  });
});
