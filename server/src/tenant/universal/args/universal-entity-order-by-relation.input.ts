import { Field, InputType } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

export enum TypeORMSortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(TypeORMSortOrder, {
  name: 'TypeORMSortOrder',
  description: undefined,
});

@InputType()
export class UniversalEntityOrderByRelationInput {
  @Field(() => TypeORMSortOrder, { nullable: true })
  id?: keyof typeof TypeORMSortOrder;

  @Field(() => GraphQLJSON, { nullable: true })
  data?: Record<string, keyof typeof TypeORMSortOrder>;

  @Field(() => TypeORMSortOrder, { nullable: true })
  createdAt?: keyof typeof TypeORMSortOrder;

  @Field(() => TypeORMSortOrder, { nullable: true })
  updatedAt?: keyof typeof TypeORMSortOrder;
}
