import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { CreateServerlessFunctionFromFileInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function-from-file.input';

@InputType()
export class CreateServerlessFunctionInput extends CreateServerlessFunctionFromFileInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  code: string;
}
