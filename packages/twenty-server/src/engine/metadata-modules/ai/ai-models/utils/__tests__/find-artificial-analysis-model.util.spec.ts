import { type ArtificialAnalysisModel } from 'src/engine/metadata-modules/ai/ai-models/types/artificial-analysis-response.schema';
import { findArtificialAnalysisModel } from 'src/engine/metadata-modules/ai/ai-models/utils/find-artificial-analysis-model.util';

const benchmark: ArtificialAnalysisModel = {
  id: 'stable-id',
  name: 'GPT-5.6 Luna (max)',
  slug: 'gpt-5-6-luna',
  model_creator: { id: 'openai', name: 'OpenAI' },
  evaluations: { artificial_analysis_intelligence_index: 62 },
  performance: { median_output_tokens_per_second: 84 },
};

const createBenchmark = ({
  name,
  slug,
}: {
  name: string;
  slug: string;
}): ArtificialAnalysisModel => ({
  ...benchmark,
  id: slug,
  name,
  slug,
});

describe('findArtificialAnalysisModel', () => {
  it('matches exact routing names across punctuation differences', () => {
    expect(
      findArtificialAnalysisModel({
        models: [benchmark],
        modelId: 'openai/gpt-5.6-luna',
        label: 'Luna',
      }),
    ).toBe(benchmark);
  });

  it('preserves the measured reasoning variant in the returned data', () => {
    expect(
      findArtificialAnalysisModel({
        models: [benchmark],
        modelId: 'gateway/custom',
        label: 'GPT-5.6 Luna (max)',
      })?.name,
    ).toBe('GPT-5.6 Luna (max)');
  });

  it('does not guess versions, reasoning variants, or ambiguous matches', () => {
    expect(
      findArtificialAnalysisModel({
        models: [benchmark],
        modelId: 'openai/gpt-5.6-sol',
        label: 'Sol',
      }),
    ).toBeUndefined();
    expect(
      findArtificialAnalysisModel({
        models: [benchmark],
        modelId: 'openai/gpt-5.6-luna-low',
        label: 'GPT-5.6 Luna (low)',
      }),
    ).toBeUndefined();
    expect(
      findArtificialAnalysisModel({
        models: [benchmark, { ...benchmark, id: 'other' }],
        modelId: 'openai/gpt-5.6-luna',
        label: 'Luna',
      }),
    ).toBeUndefined();
  });

  it.each([
    [
      'eu.anthropic.claude-opus-4-7',
      'Claude Opus 4.7 (Bedrock EU)',
      'Claude Opus 4.7',
      'claude-opus-4-7',
    ],
    [
      'global.anthropic.claude-opus-4-7',
      'Claude Opus 4.7 (Bedrock Global)',
      'Claude Opus 4.7',
      'claude-opus-4-7',
    ],
    [
      'eu.anthropic.claude-opus-4-6-v1',
      'Claude Opus 4.6 (Bedrock EU)',
      'Claude Opus 4.6 (Reasoning)',
      'claude-opus-4-6',
    ],
    [
      'global.anthropic.claude-opus-4-6-v1',
      'Claude Opus 4.6 (Bedrock Global)',
      'Claude Opus 4.6 (Reasoning)',
      'claude-opus-4-6',
    ],
    [
      'eu.anthropic.claude-sonnet-4-6',
      'Claude Sonnet 4.6 (Bedrock EU)',
      'Claude Sonnet 4.6 (Non-reasoning, High Effort)',
      'claude-sonnet-4-6',
    ],
    [
      'global.anthropic.claude-sonnet-4-6',
      'Claude Sonnet 4.6 (Bedrock Global)',
      'Claude Sonnet 4.6 (Non-reasoning, High Effort)',
      'claude-sonnet-4-6',
    ],
    [
      'eu.anthropic.claude-haiku-4-5-20251001-v1:0',
      'Claude Haiku 4.5 (Bedrock EU)',
      'Claude Haiku 4.5',
      'claude-haiku-4-5',
    ],
    [
      'global.anthropic.claude-haiku-4-5-20251001-v1:0',
      'Claude Haiku 4.5 (Bedrock Global)',
      'Claude Haiku 4.5',
      'claude-haiku-4-5',
    ],
  ])(
    'matches the Bedrock route %s to its underlying model',
    (modelName, label, benchmarkName, benchmarkSlug) => {
      const bedrockBenchmark = createBenchmark({
        name: benchmarkName,
        slug: benchmarkSlug,
      });

      expect(
        findArtificialAnalysisModel({
          models: [bedrockBenchmark],
          modelId: `bedrock/${modelName}`,
          label,
          sdkPackage: '@ai-sdk/amazon-bedrock',
        }),
      ).toBe(bedrockBenchmark);
    },
  );

  it('applies Bedrock routing rules only to Bedrock providers', () => {
    const opusBenchmark = createBenchmark({
      name: 'Claude Opus 4.6',
      slug: 'claude-opus-4-6',
    });

    expect(
      findArtificialAnalysisModel({
        models: [opusBenchmark],
        modelId: 'custom/global.anthropic.claude-opus-4-6-v1',
        label: 'Custom Opus',
      }),
    ).toBeUndefined();
  });
});
