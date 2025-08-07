import { v4 } from 'uuid';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { customAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/custom-all.view';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';
import { MKT_ALL_VIEWS } from 'src/mkt-core/enums/mkt-prefill-views';

export const prefillViews = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const customObjectMetadataItems = objectMetadataItems.filter(
    (item) => item.isCustom,
  );

  const customViews = customObjectMetadataItems.map((item) =>
    customAllView(item),
  );

  const views = [
    companiesAllView(objectMetadataItems),
    peopleAllView(objectMetadataItems),
    opportunitiesAllView(objectMetadataItems),
    opportunitiesByStageView(objectMetadataItems),
    notesAllView(objectMetadataItems),
    tasksAllView(objectMetadataItems),
    tasksAssignedToMeView(objectMetadataItems),
    tasksByStatusView(objectMetadataItems),
    workflowsAllView(objectMetadataItems),
    workflowVersionsAllView(objectMetadataItems),
    workflowRunsAllView(objectMetadataItems),
    ...MKT_ALL_VIEWS.map(item => item(objectMetadataItems)),
    ...customViews,
  ];

  return createWorkspaceViews(entityManager, schemaName, views);
};

const createWorkspaceViews = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
  viewDefinitions: ViewDefinition[],
) => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.view`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'openRecordIn',
      'kanbanFieldMetadataId',
      'kanbanAggregateOperation',
      'kanbanAggregateOperationFieldMetadataId',
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
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }) => ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }),
      ),
    )
    .returning('*')
    .execute();

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      await entityManager
        .createQueryBuilder(undefined, undefined, undefined, {
          shouldBypassPermissionChecks: true,
        })
        .insert()
        .into(`${schemaName}.viewField`, [
          'fieldMetadataId',
          'position',
          'isVisible',
          'size',
          'viewId',
          'aggregateOperation',
        ])
        .values(
          viewDefinition.fields.map((field) => ({
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: viewDefinition.id,
            aggregateOperation: field.aggregateOperation,
          })),
        )
        .execute();
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      await entityManager
        .createQueryBuilder(undefined, undefined, undefined, {
          shouldBypassPermissionChecks: true,
        })
        .insert()
        .into(`${schemaName}.viewFilter`, [
          'fieldMetadataId',
          'displayValue',
          'operand',
          'value',
          'viewId',
        ])
        .values(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        .createQueryBuilder(undefined, undefined, undefined, {
          shouldBypassPermissionChecks: true,
        })
        .insert()
        .into(`${schemaName}.viewGroup`, [
          'fieldMetadataId',
          'isVisible',
          'fieldValue',
          'position',
          'viewId',
        ])
        .values(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
