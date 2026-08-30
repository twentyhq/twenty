import { IsOptional, IsString, MaxLength } from 'class-validator';

// Whisper-family models cap the vocabulary prompt around 224 tokens and ignore
// the overflow, so an over-long list is rejected rather than silently trimmed.
const MAX_VOCABULARY_PROMPT_LENGTH = 896;

// The audio is the request body, so everything else travels as a query param.
export class TranscribeAudioInput {
  @IsString()
  @IsOptional()
  modelId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_VOCABULARY_PROMPT_LENGTH)
  vocabularyPrompt?: string;
}
