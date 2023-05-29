import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { RefreshTokenCountAggregate } from './refresh-token-count-aggregate.output';
import { RefreshTokenMinAggregate } from './refresh-token-min-aggregate.output';
import { RefreshTokenMaxAggregate } from './refresh-token-max-aggregate.output';

@ObjectType()
export class RefreshTokenGroupBy {
  @Field(() => String, { nullable: false })
  id!: string;

  @Field(() => Date, { nullable: false })
  createdAt!: Date | string;

  @Field(() => Date, { nullable: false })
  updatedAt!: Date | string;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | string;

  @Field(() => String, { nullable: false })
  refreshToken!: string;

  @Field(() => String, { nullable: false })
  userId!: string;

  @Field(() => RefreshTokenCountAggregate, { nullable: true })
  _count?: RefreshTokenCountAggregate;

  @Field(() => RefreshTokenMinAggregate, { nullable: true })
  _min?: RefreshTokenMinAggregate;

  @Field(() => RefreshTokenMaxAggregate, { nullable: true })
  _max?: RefreshTokenMaxAggregate;
}
