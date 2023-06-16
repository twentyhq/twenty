import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';
import { Type } from 'class-transformer';
import { CommentCreateOrConnectWithoutCommentThreadInput } from './comment-create-or-connect-without-comment-thread.input';
import { CommentCreateManyCommentThreadInputEnvelope } from './comment-create-many-comment-thread-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';

@InputType()
export class CommentUncheckedCreateNestedManyWithoutCommentThreadInput {

    @Field(() => [CommentCreateWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentCreateWithoutCommentThreadInput)
    create?: Array<CommentCreateWithoutCommentThreadInput>;

    @Field(() => [CommentCreateOrConnectWithoutCommentThreadInput], {nullable:true})
    @Type(() => CommentCreateOrConnectWithoutCommentThreadInput)
    connectOrCreate?: Array<CommentCreateOrConnectWithoutCommentThreadInput>;

    @Field(() => CommentCreateManyCommentThreadInputEnvelope, {nullable:true})
    @Type(() => CommentCreateManyCommentThreadInputEnvelope)
    createMany?: CommentCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;
}
