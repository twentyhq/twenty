import { Field, InputType } from '@nestjs/graphql';

import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutFilterConditionInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/page-layout-filter.input';

@InputType()
export class DashboardFilterValueInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  pageLayoutFilterId: string;

  @Field(() => [PageLayoutFilterConditionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageLayoutFilterConditionInput)
  conditions: PageLayoutFilterConditionInput[];
}
