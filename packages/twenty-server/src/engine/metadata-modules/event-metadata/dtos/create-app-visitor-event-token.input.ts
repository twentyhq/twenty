import { Field, InputType, Int } from '@nestjs/graphql';

import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType('CreateAppVisitorEventTokenInput')
export class CreateAppVisitorEventTokenInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  anonymousId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  events: string[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  expiresInSeconds?: number;
}
