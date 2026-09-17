import { Field, HideField, ObjectType } from '@nestjs/graphql';

import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';
import { FrontComponentSettingsTabDTO } from 'src/engine/metadata-modules/front-component/dtos/front-component-settings-tab.dto';

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

  @IsBoolean()
  @Field()
  isHeadless: boolean;

  @IsBoolean()
  @Field()
  usesSdkClient: boolean;

  // A non-null settingsTab marks the component as one of the application's
  // settings tabs, tab options or not.
  @IsOptional()
  @Field(() => FrontComponentSettingsTabDTO, { nullable: true })
  settingsTab?: FrontComponentSettingsTabDTO;

  @Field(() => ApplicationTokenPairDTO, { nullable: true })
  applicationTokenPair?: ApplicationTokenPairDTO;

  @Field(() => GraphQLJSON, { nullable: true })
  applicationVariables?: Record<string, string>;
}
