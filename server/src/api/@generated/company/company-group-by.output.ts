import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { CompanyCountAggregate } from './company-count-aggregate.output';
import { CompanyAvgAggregate } from './company-avg-aggregate.output';
import { CompanySumAggregate } from './company-sum-aggregate.output';
import { CompanyMinAggregate } from './company-min-aggregate.output';
import { CompanyMaxAggregate } from './company-max-aggregate.output';

@ObjectType()
export class CompanyGroupBy {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    domainName!: string;

    @Field(() => String, {nullable:false})
    address!: string;

    @Field(() => Int, {nullable:true})
    employees?: number;

    @Field(() => String, {nullable:true})
    accountOwnerId?: string;

    @Field(() => String, {nullable:false})
    workspaceId!: string;

    @Field(() => CompanyCountAggregate, {nullable:true})
    _count?: CompanyCountAggregate;

    @Field(() => CompanyAvgAggregate, {nullable:true})
    _avg?: CompanyAvgAggregate;

    @Field(() => CompanySumAggregate, {nullable:true})
    _sum?: CompanySumAggregate;

    @Field(() => CompanyMinAggregate, {nullable:true})
    _min?: CompanyMinAggregate;

    @Field(() => CompanyMaxAggregate, {nullable:true})
    _max?: CompanyMaxAggregate;
}
