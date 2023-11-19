import { Field, InputType } from '@nestjs/graphql';

import { IsDate, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateRefreshTokenInput {
  @IsDate()
  @IsNotEmpty()
  @Field()
  expiresAt: Date;
}
