import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadCreateManyInput } from './comment-thread-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyCommentThreadArgs {

    @Field(() => [CommentThreadCreateManyInput], {nullable:false})
    @Type(() => CommentThreadCreateManyInput)
    data!: Array<CommentThreadCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
