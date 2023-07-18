import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutWorkspaceInput } from './comment-thread-create-or-connect-without-workspace.input';
import { CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput } from './comment-thread-upsert-with-where-unique-without-workspace.input';
import { CommentThreadCreateManyWorkspaceInputEnvelope } from './comment-thread-create-many-workspace-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput } from './comment-thread-update-with-where-unique-without-workspace.input';
import { CommentThreadUpdateManyWithWhereWithoutWorkspaceInput } from './comment-thread-update-many-with-where-without-workspace.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUpdateManyWithoutWorkspaceNestedInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutWorkspaceInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutWorkspaceInput>;

    @HideField()
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    createMany?: CommentThreadCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    set?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    disconnect?: Array<CommentThreadWhereUniqueInput>;

    @HideField()
    delete?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;

    @HideField()
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @HideField()
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutWorkspaceInput>;

    @HideField()
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
