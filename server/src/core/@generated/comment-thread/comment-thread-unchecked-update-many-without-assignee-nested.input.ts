import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAssigneeInput } from './comment-thread-create-or-connect-without-assignee.input';
import { CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput } from './comment-thread-upsert-with-where-unique-without-assignee.input';
import { CommentThreadCreateManyAssigneeInputEnvelope } from './comment-thread-create-many-assignee-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput } from './comment-thread-update-with-where-unique-without-assignee.input';
import { CommentThreadUpdateManyWithWhereWithoutAssigneeInput } from './comment-thread-update-many-with-where-without-assignee.input';
import { CommentThreadScalarWhereInput } from './comment-thread-scalar-where.input';

@InputType()
export class CommentThreadUncheckedUpdateManyWithoutAssigneeNestedInput {

    @Field(() => [CommentThreadCreateWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutAssigneeInput)
    create?: Array<CommentThreadCreateWithoutAssigneeInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAssigneeInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAssigneeInput>;

    @Field(() => [CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput)
    upsert?: Array<CommentThreadUpsertWithWhereUniqueWithoutAssigneeInput>;

    @Field(() => CommentThreadCreateManyAssigneeInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyAssigneeInputEnvelope)
    createMany?: CommentThreadCreateManyAssigneeInputEnvelope;

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

    @Field(() => [CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput)
    update?: Array<CommentThreadUpdateWithWhereUniqueWithoutAssigneeInput>;

    @Field(() => [CommentThreadUpdateManyWithWhereWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadUpdateManyWithWhereWithoutAssigneeInput)
    updateMany?: Array<CommentThreadUpdateManyWithWhereWithoutAssigneeInput>;

    @Field(() => [CommentThreadScalarWhereInput], {nullable:true})
    @Type(() => CommentThreadScalarWhereInput)
    deleteMany?: Array<CommentThreadScalarWhereInput>;
}
