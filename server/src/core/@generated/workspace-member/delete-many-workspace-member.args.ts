import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';
import { Type } from 'class-transformer';

@ArgsType()
export class DeleteManyWorkspaceMemberArgs {

    @Field(() => WorkspaceMemberWhereInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereInput)
    where?: WorkspaceMemberWhereInput;
}
