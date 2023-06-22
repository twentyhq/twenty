import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateNestedOneWithoutCommentsInput } from '../comment-thread/comment-thread-create-nested-one-without-comments.input';
import { WorkspaceCreateNestedOneWithoutCommentsInput } from '../workspace/workspace-create-nested-one-without-comments.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentCreateWithoutAuthorInput {

    @Field(() => String, {nullable:true})
    id?: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    body!: string;

    @Field(() => CommentThreadCreateNestedOneWithoutCommentsInput, {nullable:false})
    commentThread!: CommentThreadCreateNestedOneWithoutCommentsInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutCommentsInput;
}
