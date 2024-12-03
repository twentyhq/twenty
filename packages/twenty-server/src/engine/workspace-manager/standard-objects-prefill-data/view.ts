import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';

export const viewPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataMap: Record<string, ObjectMetadataEntity>,
  isWorkflowEnabled: boolean,
) => {
  const viewDefinitions = [
    companiesAllView(objectMetadataMap),
    peopleAllView(objectMetadataMap),
    opportunitiesAllView(objectMetadataMap),
    opportunitiesByStageView(objectMetadataMap),
    notesAllView(objectMetadataMap),
    tasksAllView(objectMetadataMap),
    tasksByStatusView(objectMetadataMap),
    ...(isWorkflowEnabled
      ? [
          workflowsAllView(objectMetadataMap),
          workflowVersionsAllView(objectMetadataMap),
          workflowRunsAllView(objectMetadataMap),
        ]
      : []),
  ];

  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'kanbanFieldMetadataId',
    ])
    .values(
      viewDefinitionsWithId.map(
        ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          kanbanFieldMetadataId,
        }) => ({
          id,
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

  for (const viewDefinition of viewDefinitionsWithId) {
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
            viewId: viewDefinition.id,
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
          viewDefinition.filters.map((filter: any) => ({
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewGroup`, [
          'fieldMetadataId',
          'isVisible',
          'fieldValue',
          'position',
          'viewId',
        ])
        .values(
          viewDefinition.groups.map((group: any) => ({
            fieldMetadataId: group.fieldMetadataId,
            isVisible: group.isVisible,
            fieldValue: group.fieldValue,
            position: group.position,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }
  }

  return viewDefinitionsWithId;
};
