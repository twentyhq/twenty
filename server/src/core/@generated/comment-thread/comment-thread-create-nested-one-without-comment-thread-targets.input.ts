import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput } from './comment-thread-create-or-connect-without-comment-thread-targets.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput {

    @HideField()
    create?: CommentThreadCreateWithoutCommentThreadTargetsInput;

    @HideField()
    connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;
}
