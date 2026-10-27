import { type FrontComponentLambdaLimits } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-lambda-limits.type';

export const FRONT_COMPONENT_VENDOR_LAMBDA_LIMITS: FrontComponentLambdaLimits =
  {
    memoryMb: 4096,
    timeoutSeconds: 300,
    ephemeralStorageMb: 4096,
  };
