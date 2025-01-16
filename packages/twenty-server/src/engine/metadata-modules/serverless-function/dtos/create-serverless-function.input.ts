import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateServerlessFunctionInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  timeoutSeconds?: number;
}
