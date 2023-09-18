import { ArgsType, Field, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { IsNotEmpty, IsString } from 'class-validator';

import { ConnectionArgs } from 'src/utils/pagination';

import { CustomEntityInput } from './custom-entity.input';
import { CustomEntityOrderByRelationInput } from './custom-entity-order-by-relation.input';

@ArgsType()
export class FindManyCustomArgs extends ConnectionArgs {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  entity: string;

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
