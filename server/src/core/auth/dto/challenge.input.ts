import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ChallengeInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
