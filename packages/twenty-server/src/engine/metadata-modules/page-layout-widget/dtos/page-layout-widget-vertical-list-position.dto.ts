import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import {
  PageLayoutTabLayoutMode,
  PageLayoutWidgetVerticalListHeightBehavior,
} from 'twenty-shared/types';

registerEnumType(PageLayoutWidgetVerticalListHeightBehavior, {
  name: 'PageLayoutWidgetVerticalListHeightBehavior',
});

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

  @Field(() => PageLayoutWidgetVerticalListHeightBehavior, { nullable: true })
  @IsEnum(PageLayoutWidgetVerticalListHeightBehavior)
  @IsOptional()
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
}
