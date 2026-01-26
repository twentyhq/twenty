import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('Webhook')
export class WebhookDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  targetUrl: string;

  @IsArray()
  @Field(() => [String])
  operations: string[];

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description: string | null;

  @IsString()
  @IsNotEmpty()
  @Field()
  secret: string;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @IsDateString()
  @IsOptional()
  @Field({ nullable: true })
  deletedAt: Date | null;
}
