import { Field, HideField, InputType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import graphqlTypeJson from 'graphql-type-json';

@InputType()
export class CreateLogicFunctionInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsNumber()
  @Field({ nullable: true })
  @Min(1)
  @Max(900)
  @IsOptional()
  timeoutSeconds?: number;

  @HideField()
  applicationId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  id: string;

  @HideField()
  checksum: string;

  @IsString()
  @Field({ nullable: false })
  handlerName: string;

  @IsString()
  @Field({ nullable: false })
  sourceHandlerPath: string;

  @IsString()
  @Field({ nullable: false })
  builtHandlerPath: string;

  @Field(() => graphqlTypeJson, { nullable: true })
  @IsObject()
  @IsOptional()
  toolInputSchema?: object;

  @IsBoolean()
  @Field({ nullable: true })
  @IsOptional()
  isTool?: boolean;
}
