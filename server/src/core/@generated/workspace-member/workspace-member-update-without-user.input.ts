import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { HideField } from '@nestjs/graphql';
import { WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput } from '../workspace/workspace-update-one-required-without-workspace-member-nested.input';

@InputType()
export class WorkspaceMemberUpdateWithoutUserInput {

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
    workspace?: WorkspaceUpdateOneRequiredWithoutWorkspaceMemberNestedInput;
}
