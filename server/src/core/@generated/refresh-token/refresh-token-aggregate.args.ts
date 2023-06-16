import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { RefreshTokenWhereInput } from './refresh-token-where.input';
import { Type } from 'class-transformer';
import { RefreshTokenOrderByWithRelationInput } from './refresh-token-order-by-with-relation.input';
import { RefreshTokenWhereUniqueInput } from './refresh-token-where-unique.input';
import { Int } from '@nestjs/graphql';
import { RefreshTokenCountAggregateInput } from './refresh-token-count-aggregate.input';
import { RefreshTokenMinAggregateInput } from './refresh-token-min-aggregate.input';
import { RefreshTokenMaxAggregateInput } from './refresh-token-max-aggregate.input';

@ArgsType()
export class RefreshTokenAggregateArgs {
  @Field(() => RefreshTokenWhereInput, { nullable: true })
  @Type(() => RefreshTokenWhereInput)
  where?: RefreshTokenWhereInput;

  @Field(() => [RefreshTokenOrderByWithRelationInput], { nullable: true })
  orderBy?: Array<RefreshTokenOrderByWithRelationInput>;

  @Field(() => RefreshTokenWhereUniqueInput, { nullable: true })
  cursor?: RefreshTokenWhereUniqueInput;

  @Field(() => Int, { nullable: true })
  take?: number;

  @Field(() => Int, { nullable: true })
  skip?: number;

  @Field(() => RefreshTokenCountAggregateInput, { nullable: true })
  _count?: RefreshTokenCountAggregateInput;

  @Field(() => RefreshTokenMinAggregateInput, { nullable: true })
  _min?: RefreshTokenMinAggregateInput;

  @Field(() => RefreshTokenMaxAggregateInput, { nullable: true })
  _max?: RefreshTokenMaxAggregateInput;
}
