import { EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { viewCompanyFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-company-fields';
import { viewPersonFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-person-fields';
import { viewOpportunityFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-opportunity-fields';

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
        name: 'Index Companies',
        objectMetadataId:
          objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconBuildingSkyscraper',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All Companies',
        objectMetadataId:
          objectMetadataMap['20202020-b374-4779-a561-80086cb2e17f'].id,
        type: 'table',
        key: null,
        position: 1,
        icon: 'IconBuildingSkyscraper',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'Index People',
        objectMetadataId:
          objectMetadataMap['20202020-e674-48e5-a542-72570eee7213'].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconUser',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All People',
        objectMetadataId:
          objectMetadataMap['20202020-e674-48e5-a542-72570eee7213'].id,
        type: 'table',
        key: null,
        position: 1,
        icon: 'IconUser',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'Index Opportunities',
        objectMetadataId:
          objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconTargetArrow',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'By Stage',
        objectMetadataId:
          objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].id,
        type: 'kanban',
        key: null,
        position: 1,
        icon: 'IconLayoutKanban',
        kanbanFieldMetadataId:
          objectMetadataMap['20202020-9549-49dd-b2b2-883999db8938'].fields[
            '20202020-d09b-4f65-ac42-06a2f20ba0e8'
          ],
      },
    ])
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[`${view.name}`] = view.id;

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
      ...viewCompanyFields(viewIdMap['Index Companies'], objectMetadataMap),
      ...viewPersonFields(viewIdMap['Index People'], objectMetadataMap),
      ...viewOpportunityFields(
        viewIdMap['Index Opportunities'],
        objectMetadataMap,
      ),
      ...viewCompanyFields(viewIdMap['All Companies'], objectMetadataMap),
      ...viewPersonFields(viewIdMap['All People'], objectMetadataMap),
      ...viewOpportunityFields(viewIdMap['By Stage'], objectMetadataMap),
    ])
    .execute();
};
