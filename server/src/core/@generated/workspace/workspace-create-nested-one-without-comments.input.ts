import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutCommentsInput } from './workspace-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateOrConnectWithoutCommentsInput } from './workspace-create-or-connect-without-comments.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class WorkspaceCreateNestedOneWithoutCommentsInput {

    @HideField()
    create?: WorkspaceCreateWithoutCommentsInput;

    @HideField()
    connectOrCreate?: WorkspaceCreateOrConnectWithoutCommentsInput;

    @Field(() => WorkspaceWhereUniqueInput, {nullable:true})
    @Type(() => WorkspaceWhereUniqueInput)
    connect?: WorkspaceWhereUniqueInput;
}
