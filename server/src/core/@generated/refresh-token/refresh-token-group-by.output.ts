import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { RefreshTokenCountAggregate } from './refresh-token-count-aggregate.output';
import { RefreshTokenMinAggregate } from './refresh-token-min-aggregate.output';
import { RefreshTokenMaxAggregate } from './refresh-token-max-aggregate.output';

@ObjectType()
export class RefreshTokenGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => Boolean, {nullable:false})
    @Validator.IsBoolean()
    @Validator.IsOptional()
    isRevoked!: boolean;

    @HideField()
    userId!: string;

    @Field(() => Date, {nullable:false})
    expiresAt!: Date | string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => RefreshTokenCountAggregate, {nullable:true})
    _count?: RefreshTokenCountAggregate;

    @Field(() => RefreshTokenMinAggregate, {nullable:true})
    _min?: RefreshTokenMinAggregate;

    @Field(() => RefreshTokenMaxAggregate, {nullable:true})
    _max?: RefreshTokenMaxAggregate;
}
