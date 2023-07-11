import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ArgsType()
export class VerifyInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  loginToken: string;
}
