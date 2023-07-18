import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateOrConnectWithoutWorkspaceInput } from './comment-create-or-connect-without-workspace.input';
import { CommentUpsertWithWhereUniqueWithoutWorkspaceInput } from './comment-upsert-with-where-unique-without-workspace.input';
import { CommentCreateManyWorkspaceInputEnvelope } from './comment-create-many-workspace-input-envelope.input';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithWhereUniqueWithoutWorkspaceInput } from './comment-update-with-where-unique-without-workspace.input';
import { CommentUpdateManyWithWhereWithoutWorkspaceInput } from './comment-update-many-with-where-without-workspace.input';
import { CommentScalarWhereInput } from './comment-scalar-where.input';

@InputType()
export class CommentUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<CommentCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CommentCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<CommentUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: CommentCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    set?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    disconnect?: Array<CommentWhereUniqueInput>;

    @HideField()
    delete?: Array<CommentWhereUniqueInput>;

    @Field(() => [CommentWhereUniqueInput], {nullable:true})
    @Type(() => CommentWhereUniqueInput)
    connect?: Array<CommentWhereUniqueInput>;

    @HideField()
    update?: Array<CommentUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<CommentUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<CommentScalarWhereInput>;
}
