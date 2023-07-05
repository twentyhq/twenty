import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { PersonCountAggregate } from './person-count-aggregate.output';
import { PersonMinAggregate } from './person-min-aggregate.output';
import { PersonMaxAggregate } from './person-max-aggregate.output';

@ObjectType()
export class PersonGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    firstName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    lastName!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    email!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    phone!: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    city!: string;

    @Field(() => String, {nullable:true})
    companyId?: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => PersonCountAggregate, {nullable:true})
    _count?: PersonCountAggregate;

    @Field(() => PersonMinAggregate, {nullable:true})
    _min?: PersonMinAggregate;

    @Field(() => PersonMaxAggregate, {nullable:true})
    _max?: PersonMaxAggregate;
}
