import { Field, Int, ObjectType } from '@nestjs/graphql';

import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class TestHttpResponseDto {
  @Field(() => Int, { nullable: true })
  status?: number;

  @Field({ nullable: true })
  statusText?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  headers?: Record<string, string>;

  @Field({ nullable: true })
  data?: string;

  @Field({ nullable: true })
  error?: string;
}
