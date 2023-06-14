import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentCreateManyInput } from './comment-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyCommentArgs {

    @Field(() => [CommentCreateManyInput], {nullable:false})
    @Type(() => CommentCreateManyInput)
    data!: Array<CommentCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
