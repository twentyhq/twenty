import {
  type LanguageModelV4Content,
  type LanguageModelV4FinishReason,
  type LanguageModelV4Usage,
} from '@ai-sdk/provider';

export type ScriptedModelResponse = {
  content: LanguageModelV4Content[];
  finishReason: LanguageModelV4FinishReason;
  usage: LanguageModelV4Usage;
  // ends the stream with this error after the content, as a provider failing mid-response does
  streamError?: unknown;
};
