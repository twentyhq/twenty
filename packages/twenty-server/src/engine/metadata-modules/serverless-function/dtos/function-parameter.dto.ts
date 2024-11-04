import { Field, ObjectType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@ObjectType()
export class FunctionParameter {
  @IsString()
  @Field(() => String)
  name: string;

  @IsString()
  @Field(() => String)
  type: string;
}
