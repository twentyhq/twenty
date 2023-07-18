import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateWithoutCommentThreadInput } from './comment-thread-target-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { CommentThreadTargetCreateOrConnectWithoutCommentThreadInput } from './comment-thread-target-create-or-connect-without-comment-thread.input';
import { CommentThreadTargetUpsertWithWhereUniqueWithoutCommentThreadInput } from './comment-thread-target-upsert-with-where-unique-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetCreateManyCommentThreadInputEnvelope } from './comment-thread-target-create-many-comment-thread-input-envelope.input';
import { CommentThreadTargetWhereUniqueInput } from './comment-thread-target-where-unique.input';
import { CommentThreadTargetUpdateWithWhereUniqueWithoutCommentThreadInput } from './comment-thread-target-update-with-where-unique-without-comment-thread.input';
import { CommentThreadTargetUpdateManyWithWhereWithoutCommentThreadInput } from './comment-thread-target-update-many-with-where-without-comment-thread.input';
import { CommentThreadTargetScalarWhereInput } from './comment-thread-target-scalar-where.input';

@InputType()
export class CommentThreadTargetUncheckedUpdateManyWithoutCommentThreadNestedInput {

    @Field(() => [CommentThreadTargetCreateWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentThreadTargetCreateWithoutCommentThreadInput)
    create?: Array<CommentThreadTargetCreateWithoutCommentThreadInput>;

    @Field(() => [CommentThreadTargetCreateOrConnectWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentThreadTargetCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: Array<CommentThreadTargetCreateOrConnectWithoutCommentThreadInput>;

    @HideField()
    upsert?: Array<CommentThreadTargetUpsertWithWhereUniqueWithoutCommentThreadInput>;

    @Field(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope, {nullable:true})
    @Type(() => CommentThreadTargetCreateManyCommentThreadInputEnvelope)
    createMany?: CommentThreadTargetCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    set?: Array<CommentThreadTargetWhereUniqueInput>;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    disconnect?: Array<CommentThreadTargetWhereUniqueInput>;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    delete?: Array<CommentThreadTargetWhereUniqueInput>;

    @Field(() => [CommentThreadTargetWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadTargetWhereUniqueInput)
    connect?: Array<CommentThreadTargetWhereUniqueInput>;

    @HideField()
    update?: Array<CommentThreadTargetUpdateWithWhereUniqueWithoutCommentThreadInput>;

    @HideField()
    updateMany?: Array<CommentThreadTargetUpdateManyWithWhereWithoutCommentThreadInput>;

    @HideField()
    deleteMany?: Array<CommentThreadTargetScalarWhereInput>;
}
