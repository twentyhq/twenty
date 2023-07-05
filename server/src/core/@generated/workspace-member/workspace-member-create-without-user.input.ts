import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceCreateNestedOneWithoutWorkspaceMemberInput } from '../workspace/workspace-create-nested-one-without-workspace-member.input';

@InputType()
export class WorkspaceMemberCreateWithoutUserInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @HideField()
    workspace!: WorkspaceCreateNestedOneWithoutWorkspaceMemberInput;
}
