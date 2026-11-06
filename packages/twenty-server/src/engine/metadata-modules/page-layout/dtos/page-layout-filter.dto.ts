import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';

import {
  type PageLayoutFilter,
  type PageLayoutFilterCondition,
  PageLayoutFilterType,
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

registerEnumType(PageLayoutFilterType, { name: 'PageLayoutFilterType' });

@ObjectType('PageLayoutFilterCondition')
class PageLayoutFilterConditionDTO implements PageLayoutFilterCondition {
  @Field(() => ViewFilterOperand)
  operand: ViewFilterOperand;

  @Field()
  value: string;
}

@ObjectType('PageLayoutFilterValue')
class PageLayoutFilterValueDTO implements PageLayoutFilterValue {
  @Field(() => [PageLayoutFilterConditionDTO])
  conditions: PageLayoutFilterConditionDTO[];
}

@ObjectType('PageLayoutFilter')
export class PageLayoutFilterDTO implements PageLayoutFilter {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  label: string;

  @Field(() => PageLayoutFilterType)
  type: PageLayoutFilterType;

  @Field(() => Float)
  position: number;

  @Field(() => PageLayoutFilterValueDTO, { nullable: true })
  defaultValue: PageLayoutFilterValueDTO | null;
}
