import { Field, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ViewSortDirection } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class UpsertViewWidgetViewSortInput {
  @IsOptional()
  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @IsOptional()
  @IsEnum(ViewSortDirection)
  @Field(() => ViewSortDirection, {
    nullable: true,
    defaultValue: ViewSortDirection.ASC,
  })
  direction?: ViewSortDirection;
}
