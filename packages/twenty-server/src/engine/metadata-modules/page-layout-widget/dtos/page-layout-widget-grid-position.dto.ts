import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsIn, IsInt, IsNotEmpty, Min } from 'class-validator';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

@ObjectType('PageLayoutWidgetGridPosition')
export class PageLayoutWidgetGridPositionDTO {
  @Field(() => PageLayoutTabLayoutMode)
  @IsIn([PageLayoutTabLayoutMode.GRID])
  @IsNotEmpty()
  layoutMode: PageLayoutTabLayoutMode.GRID;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  row: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  column: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rowSpan: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  columnSpan: number;
}
