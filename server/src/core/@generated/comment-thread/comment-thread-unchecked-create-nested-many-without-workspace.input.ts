import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutWorkspaceInput } from './comment-thread-create-or-connect-without-workspace.input';
import { CommentThreadCreateManyWorkspaceInputEnvelope } from './comment-thread-create-many-workspace-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadUncheckedCreateNestedManyWithoutWorkspaceInput {

    @Field(() => [CommentThreadCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutWorkspaceInput)
    create?: Array<CommentThreadCreateWithoutWorkspaceInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => CommentThreadCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyWorkspaceInputEnvelope)
    createMany?: CommentThreadCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
