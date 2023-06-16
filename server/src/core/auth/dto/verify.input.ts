import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyInput {
  @IsNotEmpty()
  @IsString()
  loginToken: string;
}
