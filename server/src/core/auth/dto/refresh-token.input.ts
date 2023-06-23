import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class RefreshTokenInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
