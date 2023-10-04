import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class CreateCustomFieldInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  displayName: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  objectId: string;
}
