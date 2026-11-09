import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import {
  type DashboardFilterValue,
  PageLayoutFilterType,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutFilterConditionInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/page-layout-filter.input';

@InputType()
export class DashboardFilterValueInput implements DashboardFilterValue {
  @Field(() => UUIDScalarType)
  @IsUUID()
  pageLayoutFilterId: string;

  @Field(() => PageLayoutFilterType)
  @IsEnum(PageLayoutFilterType)
  type: PageLayoutFilterType;

  @Field(() => [PageLayoutFilterConditionInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PageLayoutFilterConditionInput)
  conditions: PageLayoutFilterConditionInput[];
}
