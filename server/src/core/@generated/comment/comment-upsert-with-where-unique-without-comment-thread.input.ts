import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithoutCommentThreadInput } from './comment-update-without-comment-thread.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateWithoutCommentThreadInput } from './comment-create-without-comment-thread.input';

@InputType()
export class CommentUpsertWithWhereUniqueWithoutCommentThreadInput {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    update!: CommentUpdateWithoutCommentThreadInput;

    @HideField()
    create!: CommentCreateWithoutCommentThreadInput;
}
