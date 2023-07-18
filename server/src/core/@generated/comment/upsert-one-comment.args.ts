import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateInput } from './comment-create.input';
import { HideField } from '@nestjs/graphql';
import { CommentUpdateInput } from './comment-update.input';

@ArgsType()
export class UpsertOneCommentArgs {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    create!: CommentCreateInput;

    @HideField()
    update!: CommentUpdateInput;
}
