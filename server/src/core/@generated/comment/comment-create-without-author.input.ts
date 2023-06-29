import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateNestedOneWithoutCommentsInput } from '../comment-thread/comment-thread-create-nested-one-without-comments.input';
import { WorkspaceCreateNestedOneWithoutCommentsInput } from '../workspace/workspace-create-nested-one-without-comments.input';

@InputType()
export class CommentCreateWithoutAuthorInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    @Validator.IsString()
    body!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentThreadCreateNestedOneWithoutCommentsInput, {nullable:false})
    commentThread!: CommentThreadCreateNestedOneWithoutCommentsInput;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutCommentsInput;
}
