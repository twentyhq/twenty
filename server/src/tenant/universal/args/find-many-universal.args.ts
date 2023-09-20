import { ArgsType, Field, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { IsNotEmpty, IsString } from 'class-validator';

import { ConnectionArgs } from 'src/utils/pagination';

import { UniversalEntityInput } from './universal-entity.input';
import { UniversalEntityOrderByRelationInput } from './universal-entity-order-by-relation.input';

@ArgsType()
export class FindManyUniversalArgs extends ConnectionArgs {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  entity: string;

  @Field(() => UniversalEntityInput, { nullable: true })
  where?: UniversalEntityInput;

  @Field(() => UniversalEntityOrderByRelationInput, { nullable: true })
  orderBy?: UniversalEntityOrderByRelationInput;

  @Field(() => GraphQLJSON, { nullable: true })
  cursor?: UniversalEntityInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => [String], { nullable: true })
  distinct?: Array<string>;
}
