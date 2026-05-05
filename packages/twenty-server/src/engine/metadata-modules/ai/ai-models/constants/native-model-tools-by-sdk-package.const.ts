import { type AiSdkPackage } from 'twenty-shared/ai';

import {
  AI_SDK_ANTHROPIC,
  AI_SDK_OPENAI,
  AI_SDK_XAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { type NativeModelTools } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tools.type';

export const NATIVE_MODEL_TOOLS_BY_SDK_PACKAGE = {
  [AI_SDK_ANTHROPIC]: {
    webSearch: {
      kind: 'sdk-tool',
      directToolName: 'web_search',
      providerToolKey: 'webSearch_20250305',
    },
  },
  [AI_SDK_OPENAI]: {
    webSearch: {
      kind: 'sdk-tool',
      directToolName: 'web_search',
      providerToolKey: 'webSearch',
    },
  },
  [AI_SDK_XAI]: {
    webSearch: {
      kind: 'provider-option',
      providerOptionKey: 'web',
    },
    twitterSearch: {
      kind: 'provider-option',
      providerOptionKey: 'x',
    },
  },
} as const satisfies Partial<Record<AiSdkPackage, NativeModelTools>>;
