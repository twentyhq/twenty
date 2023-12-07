import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

import { User } from 'src/core/user/user.entity';

@ArgsType()
export class SaveConnectedAccountInput {
  @Field(() => User)
  accountOwner: User;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  type: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
