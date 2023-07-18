import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { AttachmentType } from '../prisma/attachment-type.enum';
import { HideField } from '@nestjs/graphql';

@ObjectType()
export class AttachmentMinAggregate {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:true})
    fullPath?: string;

    @Field(() => AttachmentType, {nullable:true})
    type?: keyof typeof AttachmentType;

    @Field(() => String, {nullable:true})
    name?: string;

    @Field(() => String, {nullable:true})
    authorId?: string;

    @Field(() => String, {nullable:true})
    activityId?: string;

    @HideField()
    workspaceId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
