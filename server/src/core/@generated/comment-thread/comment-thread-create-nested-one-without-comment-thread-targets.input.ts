import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutCommentThreadTargetsInput } from './comment-thread-create-without-comment-thread-targets.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput } from './comment-thread-create-or-connect-without-comment-thread-targets.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadCreateNestedOneWithoutCommentThreadTargetsInput {

    @Field(() => CommentThreadCreateWithoutCommentThreadTargetsInput, {nullable:true})
    @Type(() => CommentThreadCreateWithoutCommentThreadTargetsInput)
    create?: CommentThreadCreateWithoutCommentThreadTargetsInput;

    @Field(() => CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput, {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput)
    connectOrCreate?: CommentThreadCreateOrConnectWithoutCommentThreadTargetsInput;

    @Field(() => CommentThreadWhereUniqueInput, {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: CommentThreadWhereUniqueInput;
}
