import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutAssigneeInput } from './comment-thread-update-without-assignee.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';

@InputType()
export class CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    update!: CommentThreadUpdateWithoutAssigneeInput;

    @HideField()
    create!: CommentThreadCreateWithoutAssigneeInput;
}
