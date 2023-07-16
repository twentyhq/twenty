import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateOrConnectWithoutAssigneeInput } from './comment-thread-create-or-connect-without-assignee.input';
import { CommentThreadCreateManyAssigneeInputEnvelope } from './comment-thread-create-many-assignee-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';

@InputType()
export class CommentThreadCreateNestedManyWithoutAssigneeInput {

    @Field(() => [CommentThreadCreateWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadCreateWithoutAssigneeInput)
    create?: Array<CommentThreadCreateWithoutAssigneeInput>;

    @Field(() => [CommentThreadCreateOrConnectWithoutAssigneeInput], {nullable:true})
    @Type(() => CommentThreadCreateOrConnectWithoutAssigneeInput)
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAssigneeInput>;

    @Field(() => CommentThreadCreateManyAssigneeInputEnvelope, {nullable:true})
    @Type(() => CommentThreadCreateManyAssigneeInputEnvelope)
    createMany?: CommentThreadCreateManyAssigneeInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
