import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { CommentCreateManyInput } from './comment-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyCommentArgs {

    @Field(() => [CommentCreateManyInput], {nullable:false})
    @Type(() => CommentCreateManyInput)
    @Type(() => CommentCreateManyInput)
    @ValidateNested({each: true})
    data!: Array<CommentCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
