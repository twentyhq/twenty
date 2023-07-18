import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutCommentThreadInput } from './comment-create-or-connect-without-comment-thread.input';
import { CommentUpsertWithWhereUniqueWithoutCommentThreadInput } from './comment-upsert-with-where-unique-without-comment-thread.input';
import { CommentCreateManyCommentThreadInputEnvelope } from './comment-create-many-comment-thread-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithWhereUniqueWithoutCommentThreadInput } from './comment-update-with-where-unique-without-comment-thread.input';
import { CommentUpdateManyWithWhereWithoutCommentThreadInput } from './comment-update-many-with-where-without-comment-thread.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUpdateManyWithoutCommentThreadNestedInput {

    @HideField()
    create?: Array<CommentCreateWithoutCommentThreadInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutCommentThreadInput>;

    @HideField()
    upsert?: Array<CommentUpsertWithWhereUniqueWithoutCommentThreadInput>;

    @HideField()
    createMany?: CommentCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    set?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    disconnect?: Array<CommentWhereUniqueInput>;

    @HideField()
    delete?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;

    @HideField()
    update?: Array<CommentUpdateWithWhereUniqueWithoutCommentThreadInput>;

    @HideField()
    updateMany?: Array<CommentUpdateManyWithWhereWithoutCommentThreadInput>;

    @HideField()
    deleteMany?: Array<CommentScalarWhereInput>;
}
