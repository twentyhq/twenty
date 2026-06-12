import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_GOOGLE,
  AI_SDK_MISTRAL,
  AI_SDK_OPENAI,
  AI_SDK_OPENAI_COMPATIBLE,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { type NativeModelTools } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tools.type';

export const NATIVE_MODEL_TOOLS_BY_SDK_PACKAGE = {
  [AI_SDK_ANTHROPIC]: {
    webSearch: {
      kind: 'sdk-tool',
      directToolName: 'web_search',
    },
  },
  [AI_SDK_OPENAI]: {
    webSearch: {
      kind: 'sdk-tool',
      directToolName: 'web_search',
    },
  },
  [AI_SDK_XAI]: {
    webSearch: {
      kind: 'sdk-tool',
      directToolName: 'web_search',
    },
    twitterSearch: {
      kind: 'sdk-tool',
      directToolName: 'x_search',
    },
  },
  [AI_SDK_GOOGLE]: {},
  [AI_SDK_MISTRAL]: {},
  [AI_SDK_BEDROCK]: {},
  [AI_SDK_OPENAI_COMPATIBLE]: {},
  [AI_SDK_AZURE]: {},
} as const satisfies Record<AiSdkPackage, NativeModelTools>;
