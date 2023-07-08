import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class CheckUserExistsInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  email: string;
}
