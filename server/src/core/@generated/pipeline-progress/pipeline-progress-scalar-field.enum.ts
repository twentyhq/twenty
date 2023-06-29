import { registerEnumType } from '@nestjs/graphql';

export enum PipelineProgressScalarFieldEnum {
    id = "id",
    pipelineId = "pipelineId",
    pipelineStageId = "pipelineStageId",
    progressableType = "progressableType",
    progressableId = "progressableId",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(PipelineProgressScalarFieldEnum, { name: 'PipelineProgressScalarFieldEnum', description: undefined })
