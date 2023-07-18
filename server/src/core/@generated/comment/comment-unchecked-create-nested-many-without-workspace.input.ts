import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutWorkspaceInput } from './comment-create-or-connect-without-workspace.input';
import { CommentCreateManyWorkspaceInputEnvelope } from './comment-create-many-workspace-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentUncheckedCreateNestedManyWithoutWorkspaceInput {

    @HideField()
    create?: Array<CommentCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    createMany?: CommentCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;
}
