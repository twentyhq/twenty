import { Field, InputType, Int } from '@nestjs/graphql';

import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ANONYMOUS_ID_PATTERN, EVENT_LIMITS } from 'twenty-shared/application';

@InputType('CreateAppVisitorEventTokenInput')
export class CreateAppVisitorEventTokenInput {
  @Field()
  @Matches(ANONYMOUS_ID_PATTERN)
  anonymousId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(EVENT_LIMITS.MAX_EVENTS_PER_VISITOR_TOKEN)
  @IsString({ each: true })
  events: string[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(EVENT_LIMITS.MAX_VISITOR_TOKEN_TTL_SECONDS)
  @IsOptional()
  expiresInSeconds?: number;
}
