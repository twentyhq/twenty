import { registerEnumType } from '@nestjs/graphql';

export enum PipelineStageScalarFieldEnum {
    id = "id",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    deletedAt = "deletedAt",
    name = "name",
    type = "type",
    color = "color",
    pipelineId = "pipelineId",
    workspaceId = "workspaceId"
}


registerEnumType(PipelineStageScalarFieldEnum, { name: 'PipelineStageScalarFieldEnum', description: undefined })
