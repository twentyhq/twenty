import { ArgsType, Field, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { BaseCustomArgs } from './base-custom.args';
import { CustomEntityInput } from './custom-entity.input';

@ArgsType()
export class FindManyCustomArgs extends BaseCustomArgs {
  @Field(() => CustomEntityInput, { nullable: true })
  where?: CustomEntityInput;

  @Field(() => [CustomEntityInput], { nullable: true })
  orderBy?: Array<CustomEntityInput>;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: CustomEntityInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [String], { nullable: true })
  distinct?: Array<string>;
}
