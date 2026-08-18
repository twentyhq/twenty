import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';

registerEnumType(IndexType, {
  name: 'IndexType',
  description: 'Type of the index',
});

@ObjectType('Index')
export class IndexMetadataDTO {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  name: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isCustom?: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @Field()
  isUnique: boolean;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  indexWhereClause?: string;

  @IsEnum(IndexType)
  @IsNotEmpty()
  @Field(() => IndexType)
  indexType: IndexType;

  objectMetadataId: string;

  @IsDate()
  @Field()
  createdAt: Date;

  @IsDate()
  @Field()
  updatedAt: Date;

  @HideField()
  workspaceId: string;
}
