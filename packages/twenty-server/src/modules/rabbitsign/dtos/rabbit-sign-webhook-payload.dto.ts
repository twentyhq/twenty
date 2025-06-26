import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class RabbitSignSignerDto {
  @IsString()
  email: string;

  @IsString()
  name: string;

  @IsString()
  status: string;

  @IsString()
  signingOrder: number;
}

export class RabbitSignWebhookPayloadDto {
  @IsString()
  folderId: string;

  @IsString()
  creatorEmail: string;

  @IsString()
  title: string;

  @IsString()
  summary: string;

  @IsString()
  folderStatus: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RabbitSignSignerDto)
  signers: RabbitSignSignerDto[];

  @IsArray()
  ccList: any[];

  @IsString()
  creationTimeUtc: string;

  @IsString()
  downloadUrl: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  signatureId?: string;
} 