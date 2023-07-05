import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberUpdateManyMutationInput } from './workspace-member-update-many-mutation.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';

@ArgsType()
export class UpdateManyWorkspaceMemberArgs {

    @Field(() => WorkspaceMemberUpdateManyMutationInput, {nullable:false})
    @Type(() => WorkspaceMemberUpdateManyMutationInput)
    @Type(() => WorkspaceMemberUpdateManyMutationInput)
    @ValidateNested({each: true})
    data!: WorkspaceMemberUpdateManyMutationInput;

    @Field(() => WorkspaceMemberWhereInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereInput)
    where?: WorkspaceMemberWhereInput;
}
