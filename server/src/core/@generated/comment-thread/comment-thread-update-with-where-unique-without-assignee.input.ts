import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutAssigneeInput } from './comment-thread-update-without-assignee.input';

@InputType()
export class CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadUpdateWithoutAssigneeInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutAssigneeInput)
    data!: CommentThreadUpdateWithoutAssigneeInput;
}
