import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutCommentThreadInput } from './comment-create-or-connect-without-comment-thread.input';
import { CommentCreateManyCommentThreadInputEnvelope } from './comment-create-many-comment-thread-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentCreateNestedManyWithoutCommentThreadInput {

    @HideField()
    create?: Array<CommentCreateWithoutCommentThreadInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutCommentThreadInput>;

    @HideField()
    createMany?: CommentCreateManyCommentThreadInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;
}
