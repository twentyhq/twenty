import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';
import { Company } from '../company/company.model';
import { Workspace } from '../workspace/workspace.model';
import { PipelineProgress } from '../pipeline-progress/pipeline-progress.model';
import { PersonCount } from './person-count.output';

@ObjectType()
export class Person {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    firstName!: string;

    @Field(() => String, {nullable:false})
    lastName!: string;

    @Field(() => String, {nullable:false})
    email!: string;

    @Field(() => String, {nullable:false})
    phone!: string;

    @Field(() => String, {nullable:false})
    city!: string;

    @Field(() => String, {nullable:true})
    companyId!: string | null;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt!: Date | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => Company, {nullable:true})
    company?: Company | null;

    @HideField()
    workspace?: Workspace;

    @Field(() => [PipelineProgress], {nullable:true})
    PipelineProgress?: Array<PipelineProgress>;

    @HideField()
    _count?: PersonCount;
}
