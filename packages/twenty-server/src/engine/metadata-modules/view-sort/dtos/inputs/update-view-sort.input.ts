import { Field, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'twenty-shared/types';

@InputType()
class UpdateViewSortInputUpdates {
  @IsOptional()
  @IsEnum(ViewSortDirection)
  @Field(() => ViewSortDirection, { nullable: true })
  direction?: ViewSortDirection;
}

@InputType()
export class UpdateViewSortInput {
  @IsUUID()
  @IsNotEmpty()
  @Field(() => UUIDScalarType, {
    description: 'The id of the view sort to update',
  })
  id: string;

  @Type(() => UpdateViewSortInputUpdates)
  @ValidateNested()
  @Field(() => UpdateViewSortInputUpdates, {
    description: 'The view sort to update',
  })
  update: UpdateViewSortInputUpdates;
}
