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

// The enum object itself must satisfy the shared record, so a tier added on
// one side without the other fails to compile.
const _assertTierValuesMatchShared: Record<SharedAiModelTier, AiModelTier> =
  AiModelTier;
