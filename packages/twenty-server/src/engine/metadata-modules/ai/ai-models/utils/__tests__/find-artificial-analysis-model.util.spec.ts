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
});
