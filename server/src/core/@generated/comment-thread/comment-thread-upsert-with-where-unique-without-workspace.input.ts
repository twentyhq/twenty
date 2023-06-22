import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutWorkspaceInput } from './comment-thread-update-without-workspace.input';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';

@InputType()
export class CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutWorkspaceInput)
    update!: CommentThreadUpdateWithoutWorkspaceInput;

    @Field(() => CommentThreadCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => CommentThreadCreateWithoutWorkspaceInput)
    create!: CommentThreadCreateWithoutWorkspaceInput;
}
