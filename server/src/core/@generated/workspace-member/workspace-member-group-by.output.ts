import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceMemberCountAggregate } from './workspace-member-count-aggregate.output';
import { WorkspaceMemberMinAggregate } from './workspace-member-min-aggregate.output';
import { WorkspaceMemberMaxAggregate } from './workspace-member-max-aggregate.output';

@ObjectType()
export class WorkspaceMemberGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:false})
    userId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => WorkspaceMemberCountAggregate, {nullable:true})
    _count?: WorkspaceMemberCountAggregate;

    @Field(() => WorkspaceMemberMinAggregate, {nullable:true})
    _min?: WorkspaceMemberMinAggregate;

    @Field(() => WorkspaceMemberMaxAggregate, {nullable:true})
    _max?: WorkspaceMemberMaxAggregate;
}
