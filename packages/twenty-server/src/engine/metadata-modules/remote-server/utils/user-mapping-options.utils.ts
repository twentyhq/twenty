import { InputType, Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@InputType()
export class UserMappingOptionsInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  username: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  password: string;
}

@ObjectType()
export class GetUserMappingOptions {
  @IsOptional()
  @Field(() => String, { nullable: true })
  username: string;
}
