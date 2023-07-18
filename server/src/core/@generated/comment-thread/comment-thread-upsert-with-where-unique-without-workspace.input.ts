import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithoutWorkspaceInput } from './comment-thread-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';

@InputType()
export class CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    update!: CommentThreadUpdateWithoutWorkspaceInput;

    @HideField()
    create!: CommentThreadCreateWithoutWorkspaceInput;
}
