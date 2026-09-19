import { type AiClassificationInput } from 'twenty-shared/ai';
import { z } from 'zod';

import { type AiClassificationModel } from 'src/engine/metadata-modules/ai/ai-models/types/ai-classification-model.type';

const probabilitySchema = z.number().min(0).max(1);
const responseSchema = z.object({
  model: z.string().min(1),
  answers: z.object({
    classification: z.object({
      type: z.literal('choice'),
      choice: z.string(),
      probabilities: z.record(z.string(), probabilitySchema),
    }),
  }),
  usage: z.object({
    input_tokens: z.number().int().nonnegative(),
    output_tokens: z.number().int().nonnegative(),
  }),
});

export class TypeSafeClassificationModel implements AiClassificationModel {
  constructor(
    private readonly apiKey: string,
    private readonly modelName: string,
  ) {}

  async classify(input: Omit<AiClassificationInput, 'modelId'>) {
    if (input.categories.length > 255) {
      throw new Error('TypeSafe supports at most 255 categories');
    }

    const response = await fetch('https://api.typesafe.ai/v1/systemone', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.modelName,
        state: input.text,
        questions: {
          classification: {
            type: 'choice',
            instructions: input.instructions,
            criteria: Object.fromEntries(
              input.categories.map(({ label, description }) => [
                label,
                description || null,
              ]),
            ),
          },
        },
      }),
      signal: AbortSignal.timeout(30_000),
      redirect: 'error',
    });

    if (!response.ok) {
      // Provider bodies may contain credentials or customer text.
      throw new Error(
        `TypeSafe classification request failed (HTTP ${response.status})`,
      );
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      throw new Error('TypeSafe returned an invalid classification response');
    }

    const parsed = responseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error('TypeSafe returned an invalid classification response');
    }

    const {
      model,
      answers: { classification },
      usage,
    } = parsed.data;
    const labels = input.categories.map(({ label }) => label);
    const distribution = Object.entries(classification.probabilities);
    const totalProbability = distribution.reduce(
      (total, [, probability]) => total + probability,
      0,
    );

    if (
      !labels.includes(classification.choice) ||
      distribution.length !== labels.length ||
      distribution.some(([label]) => !labels.includes(label)) ||
      Math.abs(totalProbability - 1) > 0.001
    ) {
      throw new Error('TypeSafe returned an invalid category distribution');
    }

    return {
      category: classification.choice,
      probability: classification.probabilities[classification.choice],
      probabilities: distribution.map(([category, probability]) => ({
        category,
        probability,
      })),
      resolvedModelId: model,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
      },
    };
  }
}
