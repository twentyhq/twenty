import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceCreateInput } from './workspace-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneWorkspaceArgs {

    @Field(() => WorkspaceCreateInput, {nullable:false})
    @Type(() => WorkspaceCreateInput)
    data!: WorkspaceCreateInput;
}
