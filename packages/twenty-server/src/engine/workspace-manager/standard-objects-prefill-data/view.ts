import { EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { viewCompanyFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-company-fields';
import { viewPersonFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-person-fields';
import { viewOpportunityFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-opportunity-fields';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { opportunityStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const viewPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  const createdViews = await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'kanbanFieldMetadataId',
    ])
    .values([
      {
        name: 'All Companies',
        objectMetadataId: objectMetadataMap[standardObjectIds.company].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconBuildingSkyscraper',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All People',
        objectMetadataId: objectMetadataMap[standardObjectIds.person].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconUser',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All Opportunities',
        objectMetadataId: objectMetadataMap[standardObjectIds.opportunity].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconTargetArrow',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'By Stage',
        objectMetadataId: objectMetadataMap[standardObjectIds.opportunity].id,
        type: 'kanban',
        key: null,
        position: 1,
        icon: 'IconLayoutKanban',
        kanbanFieldMetadataId:
          objectMetadataMap[standardObjectIds.opportunity].fields[
            opportunityStandardFieldIds.stage
          ],
      },
    ])
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[view.name] = view.id;

    return acc;
  }, {});

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.viewField`, [
      'fieldMetadataId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .values([
      ...viewCompanyFields(viewIdMap['All Companies'], objectMetadataMap),
      ...viewPersonFields(viewIdMap['All People'], objectMetadataMap),
      ...viewOpportunityFields(
        viewIdMap['All Opportunities'],
        objectMetadataMap,
      ),
      ...viewOpportunityFields(viewIdMap['By Stage'], objectMetadataMap),
    ])
    .execute();
};
