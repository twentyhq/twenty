import { type FrontComponentLambdaLimits } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-lambda-limits.type';

export const FRONT_COMPONENT_BUILDER_LAMBDA_LIMITS: FrontComponentLambdaLimits =
  {
    memoryMb: 512,
    timeoutSeconds: 60,
    ephemeralStorageMb: 4096,
  };
