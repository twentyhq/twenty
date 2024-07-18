import { EntityManager } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { activitiesAllNotesView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/activities-all-notes.view';
import { activitiesAllTasksView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/activities-all-tasks.view';
import { activitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/activities-all.view';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';

export const viewPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
) => {
  const viewDefinitions = [
    await companiesAllView(objectMetadataMap),
    await peopleAllView(objectMetadataMap),
    await opportunitiesAllView(objectMetadataMap),
    await opportunitiesByStageView(objectMetadataMap),
    await activitiesAllView(objectMetadataMap),
    await activitiesAllNotesView(objectMetadataMap),
    await activitiesAllTasksView(objectMetadataMap),
  ];

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
    .values(
      viewDefinitions.map(
        ({
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          kanbanFieldMetadataId,
        }) => ({
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          kanbanFieldMetadataId,
        }),
      ),
    )
    .returning('*')
    .execute();

  const viewIdMap = createdViews.raw.reduce((acc, view) => {
    acc[view.name] = view.id;

    return acc;
  }, {});

  for (const viewDefinition of viewDefinitions) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewField`, [
          'fieldMetadataId',
          'position',
          'isVisible',
          'size',
          'viewId',
        ])
        .values(
          viewDefinition.fields.map((field) => ({
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: viewIdMap[viewDefinition.name],
          })),
        )
        .execute();
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewFilter`, [
          'fieldMetadataId',
          'displayValue',
          'operand',
          'value',
          'viewId',
        ])
        .values(
          viewDefinition.filters.map((filter) => ({
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: viewIdMap[viewDefinition.name],
          })),
        )
        .execute();
    }
  }
};
