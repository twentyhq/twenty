import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutAuthorInput } from './comment-thread-update-without-author.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';

@InputType()
export class CommentThreadUpsertWithWhereUniqueWithoutAuthorInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    update!: CommentThreadUpdateWithoutAuthorInput;

    @HideField()
    create!: CommentThreadCreateWithoutAuthorInput;
}
