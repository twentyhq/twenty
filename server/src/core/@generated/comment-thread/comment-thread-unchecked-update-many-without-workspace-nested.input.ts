import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutWorkspaceInput } from './comment-thread-create-or-connect-without-workspace.input';
import { CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput } from './comment-thread-upsert-with-where-unique-without-workspace.input';
import { CommentThreadCreateManyWorkspaceInputEnvelope } from './comment-thread-create-many-workspace-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput } from './comment-thread-update-with-where-unique-without-workspace.input';
import { CommentThreadUpdateManyWithWhereWithoutWorkspaceInput } from './comment-thread-update-many-with-where-without-workspace.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUncheckedUpdateManyWithoutWorkspaceNestedInput {

    @Field(() => [CommentThreadCreateWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutWorkspaceInput)
    create?: Array<CommentThreadCreateWithoutWorkspaceInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutWorkspaceInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutWorkspaceInput>;

    @Field(() => [CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput)
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => CommentThreadCreateManyWorkspaceInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyWorkspaceInputEnvelope)
    createMany?: CommentThreadCreateManyWorkspaceInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    set?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    disconnect?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    delete?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;

    @Field(() => [CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput)
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutWorkspaceInput>;

    @Field(() => [CommentThreadUpdateManyWithWhereWithoutWorkspaceInput], {nullable:true})
    @Type(() => CommentThreadUpdateManyWithWhereWithoutWorkspaceInput)
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutWorkspaceInput>;

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    @Type(() => CommentThreadScalarWhereInput)
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
