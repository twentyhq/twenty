import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Type } from 'class-transformer';

@ArgsType()
export class FindUniqueWorkspaceMemberArgs {

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:false})
    @Type(() => WorkspaceMemberWhereUniqueInput)
    where!: WorkspaceMemberWhereUniqueInput;
}
