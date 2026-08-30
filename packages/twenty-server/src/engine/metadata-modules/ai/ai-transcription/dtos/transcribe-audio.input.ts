import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Whisper-family models cap the vocabulary prompt around 224 tokens and ignore
// the overflow, so an over-long list is rejected rather than silently trimmed.
const MAX_VOCABULARY_PROMPT_LENGTH = 896;

export class TranscribeAudioInput {
  @IsString()
  @IsNotEmpty()
  audioBase64: string;

  @IsString()
  @IsOptional()
  modelId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(MAX_VOCABULARY_PROMPT_LENGTH)
  vocabularyPrompt?: string;
}
