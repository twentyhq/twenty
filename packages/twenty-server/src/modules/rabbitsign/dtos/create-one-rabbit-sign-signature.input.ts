import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateOneRabbitSignSignatureInput {
  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  message: string;

  @Field(() => String)
  @IsString()
  workspaceMemberId: string;

  @Field(() => String)
  @IsString()
  signatureStatus: string;

  @Field(() => String)
  @IsString()
  filename: string;

  @Field(() => String)
  @IsString()
  attachmentId: string;

  @Field(() => String)
  @IsString()
  signaturesData: string;
}
