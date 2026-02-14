import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/dtos/application-token-pair.dto';

@ObjectType('FrontComponent')
export class FrontComponentDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @Field()
  name: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @Field()
  sourceComponentPath: string;

  @IsString()
  @Field()
  builtComponentPath: string;

  @IsString()
  @Field()
  componentName: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  builtComponentChecksum: string;

  @IsUUID()
  @IsOptional()
  @Field(() => UUIDScalarType, { nullable: true })
  universalIdentifier?: string;

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

  @Field(() => ApplicationTokenPairDTO, { nullable: true })
  applicationTokenPair?: ApplicationTokenPairDTO;
}
