import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../auth.util';
import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class RegisterInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: 'password too weak' })
  password: string;
}
