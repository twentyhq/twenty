import {
  type LanguageModelV4Content,
  type LanguageModelV4FinishReason,
  type LanguageModelV4Usage,
} from '@ai-sdk/provider';

export type ScriptedModelResponse = {
  content: LanguageModelV4Content[];
  finishReason: LanguageModelV4FinishReason;
  usage: LanguageModelV4Usage;
};
