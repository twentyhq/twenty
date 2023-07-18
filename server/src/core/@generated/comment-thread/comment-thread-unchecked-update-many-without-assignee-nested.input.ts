import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAssigneeInput } from './comment-thread-create-or-connect-without-assignee.input';
import { CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput } from './comment-thread-upsert-with-where-unique-without-assignee.input';
import { CommentThreadCreateManyAssigneeInputEnvelope } from './comment-thread-create-many-assignee-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput } from './comment-thread-update-with-where-unique-without-assignee.input';
import { CommentThreadUpdateManyWithWhereWithoutAssigneeInput } from './comment-thread-update-many-with-where-without-assignee.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUncheckedUpdateManyWithoutAssigneeNestedInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutAssigneeInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAssigneeInput>;

    @HideField()
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput>;

    @HideField()
    createMany?: CommentThreadCreateManyAssigneeInputEnvelope;

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
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput>;

    @HideField()
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutAssigneeInput>;

    @HideField()
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
