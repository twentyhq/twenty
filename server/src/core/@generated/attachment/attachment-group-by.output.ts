import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { AttachmentType } from '../prisma/attachment-type.enum';
import { HideField } from '@nestjs/graphql';
import { AttachmentCountAggregate } from './attachment-count-aggregate.output';
import { AttachmentMinAggregate } from './attachment-min-aggregate.output';
import { AttachmentMaxAggregate } from './attachment-max-aggregate.output';

@ObjectType()
export class AttachmentGroupBy {

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    @Validator.IsOptional()
    id!: string;

    @Field(() => String, {nullable:false})
    fullPath!: string;

    @Field(() => AttachmentType, {nullable:false})
    type!: keyof typeof AttachmentType;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:false})
    activityId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date | string;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date | string;

    @Field(() => AttachmentCountAggregate, {nullable:true})
    _count?: AttachmentCountAggregate;

    @Field(() => AttachmentMinAggregate, {nullable:true})
    _min?: AttachmentMinAggregate;

    @Field(() => AttachmentMaxAggregate, {nullable:true})
    _max?: AttachmentMaxAggregate;
}
