import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../auth.util';

export class RegisterInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: 'password too weak' })
  password: string;

  @IsNotEmpty()
  @IsString()
  displayName: string;
}
