import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { viewPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/view';
import { companyPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/company';
import { personPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/person';
import { pipelineStepPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/pipeline-step';
import { workspaceMemberPrefillData } from 'src/workspace/workspace-manager/demo-objects-prefill-data/workspace-member';
import { seedDemoOpportunity } from 'src/workspace/workspace-manager/demo-objects-prefill-data/opportunity';

export const demoObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.nameSingular] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.name] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  // TODO: udnerstand why only with this createQueryRunner transaction below works
  const queryRunner = workspaceDataSource.createQueryRunner();

  await queryRunner.connect();

  workspaceDataSource.transaction(async (entityManager: EntityManager) => {
    await companyPrefillData(entityManager, schemaName);
    await personPrefillData(entityManager, schemaName);
    await viewPrefillData(entityManager, schemaName, objectMetadataMap);
    await pipelineStepPrefillData(entityManager, schemaName);
    await seedDemoOpportunity(entityManager, schemaName);

    await workspaceMemberPrefillData(entityManager, schemaName);
  });
};
