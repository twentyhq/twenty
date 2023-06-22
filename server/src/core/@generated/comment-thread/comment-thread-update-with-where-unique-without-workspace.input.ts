import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutWorkspaceInput } from './comment-thread-update-without-workspace.input';

@InputType()
export class CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @Field(() => CommentThreadUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => CommentThreadUpdateWithoutWorkspaceInput)
    data!: CommentThreadUpdateWithoutWorkspaceInput;
}
