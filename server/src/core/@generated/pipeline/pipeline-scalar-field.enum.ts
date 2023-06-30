import { registerEnumType } from '@nestjs/graphql';

export enum PipelineScalarFieldEnum {
    id = "id",
    name = "name",
    icon = "icon",
    pipelineProgressableType = "pipelineProgressableType",
    workspaceId = "workspaceId",
    deletedAt = "deletedAt",
    createdAt = "createdAt",
    updatedAt = "updatedAt"
}


registerEnumType(PipelineScalarFieldEnum, { name: 'PipelineScalarFieldEnum', description: undefined })
