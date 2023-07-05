import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentThreadCreateManyInput } from './comment-thread-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyCommentThreadArgs {

    @Field(() => [CommentThreadCreateManyInput], {nullable:false})
    @Type(() => CommentThreadCreateManyInput)
    @Type(() => CommentThreadCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<CommentThreadCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
