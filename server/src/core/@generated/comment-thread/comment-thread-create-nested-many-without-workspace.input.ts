import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutWorkspaceInput } from './comment-thread-create-or-connect-without-workspace.input';
import { CommentThreadCreateManyWorkspaceInputEnvelope } from './comment-thread-create-many-workspace-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: CommentThreadCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
