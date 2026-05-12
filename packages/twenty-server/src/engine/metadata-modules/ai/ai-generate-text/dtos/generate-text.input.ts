import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateTextInput {
  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsString()
  @IsNotEmpty()
  userPrompt: string;

  @IsString()
  @IsOptional()
  modelId?: string;
}
