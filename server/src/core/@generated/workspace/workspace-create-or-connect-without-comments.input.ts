import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutCommentsInput {

    @Field(() => WorkspaceWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceWhereUniqueInput)
    where!: WorkspaceWhereUniqueInput;

    @Field(() => WorkspaceCreateWithoutCommentsInput, {nullable:false})
    @Type(() => WorkspaceCreateWithoutCommentsInput)
    create!: WorkspaceCreateWithoutCommentsInput;
}
