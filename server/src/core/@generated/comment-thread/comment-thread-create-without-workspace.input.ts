import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadTargetCreateNestedManyWithoutCommentThreadInput } from '../comment-thread-target/comment-thread-target-create-nested-many-without-comment-thread.input';
import { CommentCreateNestedManyWithoutCommentThreadInput } from '../comment/comment-create-nested-many-without-comment-thread.input';

@InputType()
export class CommentThreadCreateWithoutWorkspaceInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => CommentThreadTargetCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetCreateNestedManyWithoutCommentThreadInput;

    @Field(() => CommentCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    comments?: CommentCreateNestedManyWithoutCommentThreadInput;
}
