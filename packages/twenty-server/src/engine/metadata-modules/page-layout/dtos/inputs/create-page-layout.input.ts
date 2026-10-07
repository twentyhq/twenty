import { Field, InputType } from '@nestjs/graphql';

import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DashboardFilterSlot, PageLayoutType } from 'twenty-shared/types';

@InputType()
export class CreatePageLayoutInput {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => PageLayoutType, {
    nullable: true,
    defaultValue: PageLayoutType.RECORD_PAGE,
  })
  @IsEnum(PageLayoutType)
  @IsOptional()
  type?: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  @IsUUID()
  @IsOptional()
  objectMetadataId?: string | null;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsArray()
  @IsOptional()
  dashboardFilters?: DashboardFilterSlot[] | null;
}
