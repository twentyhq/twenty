import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentScalarWhereInput } from './comment-scalar-where.input';
import { Type } from 'class-transformer';
import { CommentUpdateManyMutationInput } from './comment-update-many-mutation.input';

@InputType()
export class CommentUpdateManyWithWhereWithoutAuthorInput {

    @Field(() => CommentScalarWhereInput, {nullable:false})
    @Type(() => CommentScalarWhereInput)
    where!: CommentScalarWhereInput;

    @Field(() => CommentUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentUpdateManyMutationInput)
    data!: CommentUpdateManyMutationInput;
}
