import { Field, InputType } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import {
  ANONYMOUS_ID_PATTERN,
  EVENT_OCCURRENCE_ID_PATTERN,
} from 'twenty-shared/application';

@InputType('EmitAppEventInput')
export class EmitAppEventInput {
  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  event?: string;

  @Field({ nullable: true })
  @IsUUID()
  @IsOptional()
  eventUniversalIdentifier?: string;

  @Field({ nullable: true })
  @Matches(EVENT_OCCURRENCE_ID_PATTERN)
  @IsOptional()
  id?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @Field({ nullable: true })
  @Matches(ANONYMOUS_ID_PATTERN)
  @IsOptional()
  anonymousId?: string;
}
