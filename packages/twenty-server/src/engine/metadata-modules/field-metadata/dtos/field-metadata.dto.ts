import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';
import {
  Authorize,
  FilterableField,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';

import { FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
import { FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { RelationMetadataDTO } from 'src/engine/metadata-modules/relation-metadata/dtos/relation-metadata.dto';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IsFieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-default-value.validator';
import { IsFieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/validators/is-field-metadata-options.validator';
import { IsValidMetadataName } from 'src/engine/decorators/metadata/is-valid-metadata-name.decorator';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(FieldMetadataType, {
  name: 'FieldMetadataType',
  description: 'Type of the field',
});

@ObjectType('field')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
@Relation('toRelationMetadata', () => RelationMetadataDTO, {
  nullable: true,
})
@Relation('fromRelationMetadata', () => RelationMetadataDTO, {
  nullable: true,
})
export class FieldMetadataDTO<
  T extends FieldMetadataType | 'default' = 'default',
> {
  @IsUUID()
  @IsNotEmpty()
  @IDField(() => UUIDScalarType)
  id: string;

  @IsEnum(FieldMetadataType)
  @IsNotEmpty()
  @Field(() => FieldMetadataType)
  type: FieldMetadataType;

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
  @Field({ nullable: true })
  isNullable?: boolean;

  @Validate(IsFieldMetadataDefaultValue)
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  defaultValue?: FieldMetadataDefaultValue<T>;

  @Validate(IsFieldMetadataOptions)
  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  options?: FieldMetadataOptions<T>;

  @IsOptional()
  @Field(() => GraphQLJSON, { nullable: true })
  settings?: FieldMetadataSettings<T>;

  @HideField()
  workspaceId: string;

  @IsDateString()
  @Field()
  createdAt: Date;

  @IsDateString()
  @Field()
  updatedAt: Date;
}
