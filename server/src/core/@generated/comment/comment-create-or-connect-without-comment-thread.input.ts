import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentCreateOrConnectWithoutCommentThreadInput {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    create!: CommentCreateWithoutCommentThreadInput;
}
