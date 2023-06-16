import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateManyAuthorInput } from './comment-create-many-author.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentCreateManyAuthorInputEnvelope {

    @Field(() => [CommentCreateManyAuthorInput], {nullable:false})
    @Type(() => CommentCreateManyAuthorInput)
    data!: Array<CommentCreateManyAuthorInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
