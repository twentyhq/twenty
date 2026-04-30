import { Field, HideField, InputType } from '@nestjs/graphql';

import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewSortDirection } from 'twenty-shared/types';

@InputType()
export class CreateViewSortInput {
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

  @IsUUID()
  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @HideField()
  universalIdentifier?: string;

  @HideField()
  applicationId?: string;
}
