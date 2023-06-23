import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { EnumPipelineProgressableTypeFilter } from '../prisma/enum-pipeline-progressable-type-filter.input';
import { HideField } from '@nestjs/graphql';
import { PipelineStageListRelationFilter } from '../pipeline-stage/pipeline-stage-list-relation-filter.input';
import { PipelineProgressListRelationFilter } from '../pipeline-progress/pipeline-progress-list-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class PipelineWhereInput {

    @Field(() => [PipelineWhereInput], {nullable:true})
    AND?: Array<PipelineWhereInput>;

    @Field(() => [PipelineWhereInput], {nullable:true})
    OR?: Array<PipelineWhereInput>;

    @Field(() => [PipelineWhereInput], {nullable:true})
    NOT?: Array<PipelineWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => DateTimeNullableFilter, {nullable:true})
    deletedAt?: DateTimeNullableFilter;

    @Field(() => StringFilter, {nullable:true})
    name?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    icon?: StringFilter;

    @Field(() => EnumPipelineProgressableTypeFilter, {nullable:true})
    pipelineProgressableType?: EnumPipelineProgressableTypeFilter;

    @HideField()
    workspaceId?: StringFilter;

    @Field(() => PipelineStageListRelationFilter, {nullable:true})
    pipelineStages?: PipelineStageListRelationFilter;

    @Field(() => PipelineProgressListRelationFilter, {nullable:true})
    pipelineProgresses?: PipelineProgressListRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
