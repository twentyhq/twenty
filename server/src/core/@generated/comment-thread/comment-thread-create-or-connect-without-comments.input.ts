import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutCommentsInput } from './comment-thread-create-without-comments.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateOrConnectWithoutCommentsInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    create!: CommentThreadCreateWithoutCommentsInput;
}
