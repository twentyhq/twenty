import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  FRONT_COMPONENT_SURFACES,
  type FrontComponentSurface,
} from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';

const FrontComponentSurfaceEnum = Object.fromEntries(
  FRONT_COMPONENT_SURFACES.map((surface) => [surface, surface]),
) as { [P in FrontComponentSurface]: P };

registerEnumType(FrontComponentSurfaceEnum, {
  name: 'FrontComponentSurface',
});

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

  @IsArray()
  @IsIn(FRONT_COMPONENT_SURFACES, { each: true })
  @Field(() => [FrontComponentSurfaceEnum])
  availableOn: FrontComponentSurface[];

  @IsBoolean()
  @Field()
  usesSdkClient: boolean;

  @Field(() => ApplicationTokenPairDTO, {
    nullable: true,
    deprecationReason: 'Use generateFrontComponentApplicationTokenPair',
  })
  applicationTokenPair?: ApplicationTokenPairDTO;

  @Field(() => GraphQLJSON, { nullable: true })
  applicationVariables?: Record<string, string>;
}
