import { DataSource } from 'typeorm';

import { SeedObjectMetadata } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedPipelineStepFieldMetadata {
  NameMetadataId = '20202020-f294-430e-b800-3a411fc05ad3',
  ColorMetadataId = '20202020-5b93-4b28-8c45-7988ea68f91b',
  PositionMetadataId = '20202020-6296-4cab-aafb-121ef5822b13',
  OpportunitiesMetadataId = '20202020-22c4-443a-b114-43c97dda5867',
}

export const seedOpportunityFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
      'objectMetadataId',
      'isCustom',
      'workspaceId',
      'isActive',
      'type',
      'name',
      'label',
      'targetColumnMap',
      'description',
      'icon',
      'isNullable',
    ])
    .orIgnore()
    .values([
      // Main Identifier
      {
        id: SeedPipelineStepFieldMetadata.ColorMetadataId,
        objectMetadataId: SeedObjectMetadata.PipelineStepMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'name',
        label: 'Name',
        targetColumnMap: {
          value: 'name',
        },
        description: 'Pipeline Step name',
        icon: 'IconCurrencyDollar',
        isNullable: false,
      },

      // Scalar Fields
      {
        id: SeedPipelineStepFieldMetadata.ColorMetadataId,
        objectMetadataId: SeedObjectMetadata.PipelineStepMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'color',
        label: 'Color',
        targetColumnMap: {
          value: 'color',
        },
        description: 'Pipeline Step color',
        icon: 'IconColorSwatch',
        isNullable: false,
      },
      {
        id: SeedPipelineStepFieldMetadata.PositionMetadataId,
        objectMetadataId: SeedObjectMetadata.PipelineStepMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'NUMBER',
        name: 'position',
        label: 'Position',
        targetColumnMap: {
          value: 'position',
        },
        description: 'Pipeline Step position',
        icon: 'IconHierarchy2',
        isNullable: false,
      },

      // Relationships
      {
        id: SeedPipelineStepFieldMetadata.OpportunitiesMetadataId,
        objectMetadataId: SeedObjectMetadata.PipelineStepMetadataId,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'opportunities',
        label: 'Opportunities',
        targetColumnMap: {},
        description: 'Opportunities linked to the step.',
        icon: 'IconTargetArrow',
        isNullable: true,
      },
    ])
    .execute();
};
