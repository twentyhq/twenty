import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadMinAggregateInput {

    @Field(() => Boolean, {nullable:true})
    id?: true;

    @HideField()
    workspaceId?: true;

    @Field(() => Boolean, {nullable:true})
    authorId?: true;

    @Field(() => Boolean, {nullable:true})
    body?: true;

    @Field(() => Boolean, {nullable:true})
    title?: true;

    @Field(() => Boolean, {nullable:true})
    type?: true;

    @Field(() => Boolean, {nullable:true})
    reminderAt?: true;

    @Field(() => Boolean, {nullable:true})
    dueAt?: true;

    @Field(() => Boolean, {nullable:true})
    completedAt?: true;

    @Field(() => Boolean, {nullable:true})
    assigneeId?: true;

    @HideField()
    deletedAt?: true;

    @Field(() => Boolean, {nullable:true})
    createdAt?: true;

    @Field(() => Boolean, {nullable:true})
    updatedAt?: true;
}
