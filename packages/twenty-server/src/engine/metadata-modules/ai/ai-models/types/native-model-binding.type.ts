import { type ProviderOptions } from '@ai-sdk/provider-utils';
import { type ToolSet } from 'ai';

export type NativeModelBinding = {
  tools: ToolSet;
  providerOptions: ProviderOptions;
};
