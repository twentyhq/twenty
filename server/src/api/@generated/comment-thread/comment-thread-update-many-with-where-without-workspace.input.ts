import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateManyMutationInput } from './comment-thread-update-many-mutation.input';

@InputType()
export class CommentThreadUpdateManyWithWhereWithoutWorkspaceInput {

    @Field(() => CommentThreadScalarWhereInput, {nullable:false})
    @Type(() => CommentThreadScalarWhereInput)
    where!: CommentThreadScalarWhereInput;

    @Field(() => CommentThreadUpdateManyMutationInput, {nullable:false})
    @Type(() => CommentThreadUpdateManyMutationInput)
    data!: CommentThreadUpdateManyMutationInput;
}
