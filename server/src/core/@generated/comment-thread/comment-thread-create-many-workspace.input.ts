import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { ActivityType } from '../prisma/activity-type.enum';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateManyWorkspaceInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:true})
    body?: string;

    @Field(() => String, {nullable:true})
    title?: string;

    @Field(() => ActivityType, {nullable:true})
    type?: keyof typeof ActivityType;

    @Field(() => Date, {nullable:true})
    reminderAt?: Date | string;

    @Field(() => Date, {nullable:true})
    dueAt?: Date | string;

    @Field(() => Date, {nullable:true})
    completedAt?: Date | string;

    @Field(() => String, {nullable:true})
    assigneeId?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
