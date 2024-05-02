import { InputType, Field, ObjectType } from '@nestjs/graphql';

import { IsOptional } from 'class-validator';

@ObjectType()
@InputType()
export class UserMappingOptions {
  @IsOptional()
  @Field(() => String, { nullable: true })
  user: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  password: string;
}

@InputType()
export class UserMappingOptionsUpdateInput {
  @IsOptional()
  @Field(() => String, { nullable: true })
  user?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  password?: string;
}
