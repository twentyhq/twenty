import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@InputType('EmitAppEventInput')
export class EmitAppEventInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  event: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  anonymousId?: string;
}
