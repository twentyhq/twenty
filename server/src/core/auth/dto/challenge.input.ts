import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class ChallengeInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  password: string;
}
