import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';

@InputType()
export class CommentThreadCreateOrConnectWithoutWorkspaceInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadCreateWithoutWorkspaceInput, {nullable:false})
    @Type(() => CommentThreadCreateWithoutWorkspaceInput)
    create!: CommentThreadCreateWithoutWorkspaceInput;
}
