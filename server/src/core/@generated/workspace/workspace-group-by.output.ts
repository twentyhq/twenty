import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCountAggregate } from './workspace-count-aggregate.output';
import { WorkspaceMinAggregate } from './workspace-min-aggregate.output';
import { WorkspaceMaxAggregate } from './workspace-max-aggregate.output';

@ObjectType()
export class WorkspaceGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    domainName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    displayName?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    logo?: string;

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    inviteHash?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => WorkspaceCountAggregate, {nullable:true})
    _count?: WorkspaceCountAggregate;

    @Field(() => WorkspaceMinAggregate, {nullable:true})
    _min?: WorkspaceMinAggregate;

    @Field(() => WorkspaceMaxAggregate, {nullable:true})
    _max?: WorkspaceMaxAggregate;
}
