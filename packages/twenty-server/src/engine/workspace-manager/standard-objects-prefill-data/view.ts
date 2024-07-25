import { EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { viewCompanyFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-company-fields';
import { viewOpportunityFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-opportunity-fields';
import { viewPersonFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-person-fields';
import { viewWorkflowFields } from 'src/engine/workspace-manager/standard-objects-prefill-data/view-workflow-fields';
import { OPPORTUNITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

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
        objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.company].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconBuildingSkyscraper',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All People',
        objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.person].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconUser',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'All Opportunities',
        objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconTargetArrow',
        kanbanFieldMetadataId: '',
      },
      {
        name: 'By Stage',
        objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].id,
        type: 'kanban',
        key: null,
        position: 1,
        icon: 'IconLayoutKanban',
        kanbanFieldMetadataId:
          objectMetadataMap[STANDARD_OBJECT_IDS.opportunity].fields[
            OPPORTUNITY_STANDARD_FIELD_IDS.stage
          ],
      },
      {
        name: 'All Workflows',
        objectMetadataId: objectMetadataMap[STANDARD_OBJECT_IDS.workflow].id,
        type: 'table',
        key: 'INDEX',
        position: 0,
        icon: 'IconSettingsAutomation',
        kanbanFieldMetadataId: '',
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
      ...viewWorkflowFields(viewIdMap['All Workflows'], objectMetadataMap),
    ])
    .execute();
};
