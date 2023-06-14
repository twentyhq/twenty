import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetUpdateWithoutCommentThreadInput } from './comment-thread-target-update-without-comment-thread.input';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';

@InputType()
export class CommentThreadTargetUpsertWithWhereUniqueWithoutCommentThreadInput {

    @Field(() => CommentThreadTargetWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    where!: CommentThreadTargetWhereUniqueInput;

    @Field(() => CommentThreadTargetUpdateWithoutCommentThreadInput, {nullable:false})
    @Type(() => CommentThreadTargetUpdateWithoutCommentThreadInput)
    update!: CommentThreadTargetUpdateWithoutCommentThreadInput;

    @Field(() => CommentThreadTargetCreateWithoutCommentThreadInput, {nullable:false})
    @Type(() => CommentThreadTargetCreateWithoutCommentThreadInput)
    create!: CommentThreadTargetCreateWithoutCommentThreadInput;
}
