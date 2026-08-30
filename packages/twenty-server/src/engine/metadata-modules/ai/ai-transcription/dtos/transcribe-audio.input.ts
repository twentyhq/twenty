import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// Whisper-family models cap the vocabulary prompt around 224 tokens and ignore
// the overflow, so an over-long list is rejected rather than silently trimmed.
const MAX_VOCABULARY_PROMPT_LENGTH = 896;

const MAX_LANGUAGE_TAG_LENGTH = 35;

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

  // BCP-47 tag from the speaker's Twenty locale. Whisper auto-detects when it
  // is absent, which it gets wrong often enough on a short first utterance.
  @IsString()
  @IsOptional()
  @MaxLength(MAX_LANGUAGE_TAG_LENGTH)
  language?: string;
}
