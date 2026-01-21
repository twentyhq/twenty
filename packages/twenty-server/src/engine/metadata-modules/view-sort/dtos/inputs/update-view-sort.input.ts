import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';

@InputType()
class UpdateViewSortInputUpdates {
  @IsOptional()
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
