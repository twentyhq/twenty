import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutAuthorInput } from './comment-thread-create-without-author.input';

@InputType()
export class CommentThreadCreateOrConnectWithoutAuthorInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadCreateWithoutAuthorInput, {nullable:false})
    @Type(() => CommentThreadCreateWithoutAuthorInput)
    create!: CommentThreadCreateWithoutAuthorInput;
}
