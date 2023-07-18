import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetCreateOrConnectWithoutCommentThreadInput } from './comment-thread-target-create-or-connect-without-comment-thread.input';
import { CommentThreadTargetCreateManyCommentThreadInputEnvelope } from './comment-thread-target-create-many-comment-thread-input-envelope.input';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput {

    @HideField()
    create?: Array<CommentThreadTargetCreateWithoutCommentThreadInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>;

    @HideField()
    createMany?: CommentThreadTargetCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    connect?: Array<CommentThreadTargetWhereUniqueInput>;
}
