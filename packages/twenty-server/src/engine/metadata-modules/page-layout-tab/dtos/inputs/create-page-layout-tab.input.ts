import { Field, Float, InputType } from '@nestjs/graphql';

import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreatePageLayoutTabInput {
  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  position?: number;

  @Field(() => UUIDScalarType, { nullable: false })
  @IsUUID()
  @IsNotEmpty()
  pageLayoutId: string;

  @Field(() => PageLayoutTabLayoutMode, {
    nullable: true,
    defaultValue: PageLayoutTabLayoutMode.GRID,
  })
  @IsEnum(PageLayoutTabLayoutMode)
  @IsOptional()
  layoutMode?: PageLayoutTabLayoutMode;
}
