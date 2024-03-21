import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateRemoteServerInput {
  @Field(() => String)
  @IsString()
  host: string;

  @Field(() => String)
  @IsString()
  port: string;

  @Field(() => String)
  @IsString()
  database: string;

  @Field(() => String)
  @IsString()
  username: string;

  @Field(() => String)
  @IsString()
  password: string;

  // TODO: Decide if this should be added during the creation
  @Field(() => String)
  @IsString()
  schema: string;
}
