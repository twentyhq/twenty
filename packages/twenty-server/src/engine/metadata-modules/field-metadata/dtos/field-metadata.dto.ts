import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import {
  type FieldMetadataOptions,
  type FieldMetadataSettings,
  FieldMetadataType,
  type FieldMetadataDefaultValue,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { type FieldMetadataOverrides } from 'src/engine/metadata-modules/field-metadata/types/field-metadata-overrides.type';
import { type FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { transformEnumValue } from 'src/engine/utils/transform-enum-value';

registerEnumType(FieldMetadataType, {
  name: 'FieldMetadataType',
  description: 'Type of the field',
});

@ObjectType('Field')
// TODO refactor nullable fields to be typed as nullable and not optional
export class FieldMetadataDTO<T extends FieldMetadataType = FieldMetadataType> {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType)
  id: string;

  @IsNotEmpty()
  @Field()
  universalIdentifier: string;

  @IsEnum(FieldMetadataType)
  @IsNotEmpty()
  @Field(() => FieldMetadataType)
  type: T;

  @IsString()
  @IsNotEmpty()
  @Field()
  @IsValidMetadataName()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  label: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  icon?: string;

  @HideField()
  overrides?: FieldMetadataOverrides | null;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isSystem?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isUIEditable?: boolean;

  // Deprecated alias kept for one release: stays exposed (and filterable via
  // FieldFilter) so external API consumers are not broken.
  @IsBoolean()
  @IsOptional()
  @Field({
    nullable: true,
    deprecationReason: 'Use isUIEditable',
  })
  isUIReadOnly?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isNullable?: boolean;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isUnique?: boolean;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  defaultValue?: FieldMetadataDefaultValue<T>;

  @Transform(({ value }) =>
    transformEnumValue(value as FieldMetadataDefaultOption[]),
  )
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  options?: FieldMetadataOptions<T>;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  settings?: FieldMetadataSettings<T>;

  @HideField()
  workspaceId: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isLabelSyncedWithName?: boolean;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  morphId?: string;

  @IsDateString(undefined, {
    message: ({ value }) =>
      `Field metadata created at is invalid got ${JSON.stringify(value)} isDate: ${value instanceof Date}`,
  })
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @Field(() => UUIDScalarType)
  applicationId: string;
}
