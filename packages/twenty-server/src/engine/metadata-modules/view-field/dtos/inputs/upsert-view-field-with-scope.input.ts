import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { AggregateOperations } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFieldScopeInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/view-field-scope.input';
import { ViewFieldSettingsInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/view-field-settings.input';

@InputType()
export class UpsertViewFieldWithScopeInput {
  @IsUUID()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view field, created when it does not exist',
  })
  id: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  viewId: string;

  @IsUUID()
  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isCanonical?: boolean;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  size?: number;

  @IsOptional()
  @IsNumber()
  @Field({ nullable: true })
  position?: number;

  @IsOptional()
  @IsEnum(AggregateOperations)
  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations | null;

  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  relationTargetFieldMetadataId?: string | null;

  @IsOptional()
  @Type(() => ViewFieldSettingsInput)
  @ValidateNested()
  @Field(() => ViewFieldSettingsInput, { nullable: true })
  settings?: ViewFieldSettingsInput | null;

  @IsOptional()
  @Type(() => ViewFieldScopeInput)
  @ValidateNested()
  @Field(() => ViewFieldScopeInput, {
    nullable: true,
    description:
      'The filters and sorts scoping the related records; without filters or sorts the scope is removed',
  })
  scope?: ViewFieldScopeInput | null;
}
