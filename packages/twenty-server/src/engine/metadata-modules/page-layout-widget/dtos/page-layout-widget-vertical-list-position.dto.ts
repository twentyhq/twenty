import { Field, Int, ObjectType } from '@nestjs/graphql';

import { IsIn, IsInt, IsNotEmpty, Min } from 'class-validator';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

@ObjectType('PageLayoutWidgetVerticalListPosition')
export class PageLayoutWidgetVerticalListPositionDTO {
  @Field(() => PageLayoutTabLayoutMode)
  @IsIn([PageLayoutTabLayoutMode.VERTICAL_LIST])
  @IsNotEmpty()
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  index: number;
}
