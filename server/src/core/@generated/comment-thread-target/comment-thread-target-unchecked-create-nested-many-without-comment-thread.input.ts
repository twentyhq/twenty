import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetCreateOrConnectWithoutCommentThreadInput } from './comment-thread-target-create-or-connect-without-comment-thread.input';
import { CommentThreadTargetCreateManyCommentThreadInputEnvelope } from './comment-thread-target-create-many-comment-thread-input-envelope.input';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';

@InputType()
export class CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput {

    @Field(() => [CommentThreadTargetCreateWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentThreadTargetCreateWithoutCommentThreadInput)
    create?: Array<CommentThreadTargetCreateWithoutCommentThreadInput>;

    @Field(() => [CommentThreadTargetCreateOrConnectWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentThreadTargetCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>;

    @Field(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope, {nullable:true})
    @Type(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope)
    createMany?: CommentThreadTargetCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    connect?: Array<CommentThreadTargetWhereUniqueInput>;
}
