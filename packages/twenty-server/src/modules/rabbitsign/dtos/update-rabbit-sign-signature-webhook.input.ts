import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateRabbitSignSignatureWebhookInput {
  @Field(() => String)
  @IsString()
  signatureId: string;

  @Field(() => String)
  @IsString()
  rabbitSignData: string;
} 