import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateOrConnectWithoutAssigneeInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    create!: CommentThreadCreateWithoutAssigneeInput;
}
