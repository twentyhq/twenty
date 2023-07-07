import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateManyAuthorInput } from './comment-thread-create-many-author.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateManyAuthorInputEnvelope {

    @Field(() => [CommentThreadCreateManyAuthorInput], {nullable:false})
    @Type(() => CommentThreadCreateManyAuthorInput)
    data!: Array<CommentThreadCreateManyAuthorInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
