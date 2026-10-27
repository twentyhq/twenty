import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { ANONYMOUS_ID_PATTERN } from 'twenty-shared/application';

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
  @Matches(ANONYMOUS_ID_PATTERN)
  @IsOptional()
  anonymousId?: string;
}
