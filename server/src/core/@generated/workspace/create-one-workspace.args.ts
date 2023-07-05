import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceCreateInput } from './workspace-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneWorkspaceArgs {

    @Field(() => WorkspaceCreateInput, {nullable:false})
    @Type(() => WorkspaceCreateInput)
    @Type(() => WorkspaceCreateInput)
    @ValidateNested({each: true})
    data!: WorkspaceCreateInput;
}
