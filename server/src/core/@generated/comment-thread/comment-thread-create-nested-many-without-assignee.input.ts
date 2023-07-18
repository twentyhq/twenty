import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadCreateWithoutAssigneeInput } from './comment-thread-create-without-assignee.input';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateOrConnectWithoutAssigneeInput } from './comment-thread-create-or-connect-without-assignee.input';
import { CommentThreadCreateManyAssigneeInputEnvelope } from './comment-thread-create-many-assignee-input-envelope.input';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class CommentThreadCreateNestedManyWithoutAssigneeInput {

    @HideField()
    create?: Array<CommentThreadCreateWithoutAssigneeInput>;

    @HideField()
    connectOrCreate?: Array<CommentThreadCreateOrConnectWithoutAssigneeInput>;

    @HideField()
    createMany?: CommentThreadCreateManyAssigneeInputEnvelope;

    @Field(() => [CommentThreadWhereUniqueInput], {nullable:true})
    @Type(() => CommentThreadWhereUniqueInput)
    connect?: Array<CommentThreadWhereUniqueInput>;
}
