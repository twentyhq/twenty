import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../auth.util';

export class ChallengeInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, { message: 'password too weak' })
  password: string;
}
