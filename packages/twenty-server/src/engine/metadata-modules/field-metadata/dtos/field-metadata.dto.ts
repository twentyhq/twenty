import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';
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
  FieldMetadataOptions,
  FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { FieldStandardOverridesDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-standard-overrides.dto';
import { type FieldMetadataDefaultOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import { transformEnumValue } from 'src/engine/utils/transform-enum-value';

registerEnumType(FieldMetadataType, {
  name: 'FieldMetadataType',
  description: 'Type of the field',
});

@ObjectType('Field')
@Authorize({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
@Relation('object', () => ObjectMetadataDTO, {
  nullable: true,
})
// TODO refactor nullable fields to be typed as nullable and not optional
export class FieldMetadataDTO<T extends FieldMetadataType = FieldMetadataType> {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

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

  @IsOptional()
  @Field(() => FieldStandardOverridesDTO, { nullable: true })
  standardOverrides?: FieldStandardOverridesDTO;

  @IsBoolean()
  @IsOptional()
  @FilterableField({ nullable: true })
  isCustom?: boolean;

  @IsBoolean()
  @IsOptional()
  @FilterableField({ nullable: true })
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @FilterableField({ nullable: true })
  isSystem?: boolean;

  @IsBoolean()
  @IsOptional()
  @FilterableField({ nullable: true })
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

  objectMetadataId: string;

  @IsBoolean()
  @IsOptional()
  @Field({ nullable: true })
  isLabelSyncedWithName?: boolean;

  @IsDateString(undefined, {
    message: ({ value }) =>
      `Field metadata created at is invalid got ${JSON.stringify(value)} isDate: ${value instanceof Date}`,
  })
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;

  @Field(() => UUIDScalarType, { nullable: true })
  applicationId?: string;
}
