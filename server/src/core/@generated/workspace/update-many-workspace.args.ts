import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceUpdateManyMutationInput } from './workspace-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { WorkspaceWhereInput } from './workspace-where.input';

@ArgsType()
export class UpdateManyWorkspaceArgs {

    @Field(() => WorkspaceUpdateManyMutationInput, {nullable:false})
    @Type(() => WorkspaceUpdateManyMutationInput)
    @ValidateNested({each: true})
    @Type(() => WorkspaceUpdateManyMutationInput)
    data!: WorkspaceUpdateManyMutationInput;

    @Field(() => WorkspaceWhereInput, {nullable:true})
    @Type(() => WorkspaceWhereInput)
    where?: WorkspaceWhereInput;
}
