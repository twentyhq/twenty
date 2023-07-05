import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberCreateInput } from './workspace-member-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOneWorkspaceMemberArgs {

    @Field(() => WorkspaceMemberCreateInput, {nullable:false})
    @Type(() => WorkspaceMemberCreateInput)
    @Type(() => WorkspaceMemberCreateInput)
    @ValidateNested({each: true})
    data!: WorkspaceMemberCreateInput;
}
