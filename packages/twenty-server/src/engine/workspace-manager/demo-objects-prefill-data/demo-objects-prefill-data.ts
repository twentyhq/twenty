import { DataSource, EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { workspaceMemberPrefillData } from 'src/engine/workspace-manager/demo-objects-prefill-data/workspace-member';
import { viewPrefillData } from 'src/engine/workspace-manager/standard-objects-prefill-data/view';
import { companyPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/company';
import { personPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/person';
import { opportunityPrefillDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/opportunity';

export const demoObjectsPrefillData = async (
  workspaceDataSource: DataSource,
  schemaName: string,
  objectMetadata: ObjectMetadataEntity[],
) => {
  const objectMetadataMap = objectMetadata.reduce((acc, object) => {
    acc[object.standardId ?? ''] = {
      id: object.id,
      fields: object.fields.reduce((acc, field) => {
        acc[field.standardId ?? ''] = field.id;

        return acc;
      }, {}),
    };

    return acc;
  }, {});

  await workspaceDataSource.transaction(
    async (entityManager: EntityManager) => {
      await companyPrefillDemoData(entityManager, schemaName);
      await personPrefillDemoData(entityManager, schemaName);
      await opportunityPrefillDemoData(entityManager, schemaName);

      await viewPrefillData(entityManager, schemaName, objectMetadataMap);

      await workspaceMemberPrefillData(entityManager, schemaName);
    },
  );
};
