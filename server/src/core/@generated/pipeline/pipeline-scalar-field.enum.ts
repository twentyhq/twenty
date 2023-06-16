import { registerEnumType } from '@nestjs/graphql';

export enum PipelineScalarFieldEnum {
  id = 'id',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deletedAt = 'deletedAt',
  name = 'name',
  icon = 'icon',
  workspaceId = 'workspaceId',
}

registerEnumType(PipelineScalarFieldEnum, {
  name: 'PipelineScalarFieldEnum',
  description: undefined,
});
