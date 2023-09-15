import { ArgsType, Field, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { BaseCustomArgs } from './base-custom.args';
import { CustomEntityInput } from './custom-entity.input';
import { CustomEntityOrderByRelationInput } from './custom-entity-order-by-relation.input';

@ArgsType()
export class FindManyCustomArgs extends BaseCustomArgs {
  @Field(() => CustomEntityInput, { nullable: true })
  where?: CustomEntityInput;

  @Field(() => CustomEntityOrderByRelationInput, { nullable: true })
  orderBy?: CustomEntityOrderByRelationInput;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: CustomEntityInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [String], { nullable: true })
  distinct?: Array<string>;
}
