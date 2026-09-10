import { registerEnumType } from '@nestjs/graphql';

import { type AiModelTier as SharedAiModelTier } from 'twenty-shared/ai';

// GraphQL needs a runtime enum. Keys equal values so the GraphQL names are the
// twenty-shared tier literals and the client can use one type on both sides.
export enum AiModelTier {
  extraFast = 'extraFast',
  fast = 'fast',
  balanced = 'balanced',
  smart = 'smart',
  extraSmart = 'extraSmart',
}

registerEnumType(AiModelTier, { name: 'AiModelTier' });

const assertTierValuesMatchShared: Record<SharedAiModelTier, AiModelTier> = {
  extraFast: AiModelTier.extraFast,
  fast: AiModelTier.fast,
  balanced: AiModelTier.balanced,
  smart: AiModelTier.smart,
  extraSmart: AiModelTier.extraSmart,
};

void assertTierValuesMatchShared;
