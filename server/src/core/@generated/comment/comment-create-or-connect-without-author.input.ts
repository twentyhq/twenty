import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateWithoutAuthorInput } from './comment-create-without-author.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentCreateOrConnectWithoutAuthorInput {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    create!: CommentCreateWithoutAuthorInput;
}
