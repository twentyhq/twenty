import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput } from '../comment-thread-target/comment-thread-target-unchecked-create-nested-many-without-comment-thread.input';

@InputType()
export class CommentThreadUncheckedCreateWithoutCommentsInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @HideField()
    workspaceId!: string;

    @Field(() => CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput, {nullable:true})
    commentThreadTargets?: CommentThreadTargetUncheckedCreateNestedManyWithoutCommentThreadInput;
}
