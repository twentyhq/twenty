import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateManyCommentThreadInput } from './comment-create-many-comment-thread.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentCreateManyCommentThreadInputEnvelope {

    @Field(() => [CommentCreateManyCommentThreadInput], {nullable:false})
    @Type(() => CommentCreateManyCommentThreadInput)
    data!: Array<CommentCreateManyCommentThreadInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
