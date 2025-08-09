import { type ViewFilterOperand as SharedViewFilterOperand } from 'twenty-shared/types';
import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { ViewField } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilter } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroup } from 'src/engine/core-modules/view/entities/view-group.entity';
import { View } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
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
import { convertViewFilterOperandToCoreOperand } from 'src/modules/view/utils/convert-view-filter-operand-to-core-operand.util';

export const prefillCoreViews = async (
  dataSource: DataSource,
  workspaceId: string,
  objectMetadataItems: ObjectMetadataEntity[],
): Promise<View[]> => {
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
    ...customViews,
  ];

  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const createdViews = await createCoreViews(queryRunner, workspaceId, views);

    await queryRunner.commitTransaction();

    return createdViews;
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw error;
  } finally {
    await queryRunner.release();
  }
};

const createCoreViews = async (
  queryRunner: QueryRunner,
  workspaceId: string,
  viewDefinitions: ViewDefinition[],
): Promise<View[]> => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  const coreViews: Partial<View>[] = viewDefinitionsWithId.map(
    ({
      id,
      name,
      objectMetadataId,
      type,
      key,
      position,
      icon,
      openRecordIn,
      kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId,
    }) => ({
      id,
      name,
      objectMetadataId,
      type: type === 'kanban' ? ViewType.KANBAN : ViewType.TABLE,
      key: key || undefined,
      position,
      icon,
      isCompact: false,
      openRecordIn:
        openRecordIn === 'SIDE_PANEL'
          ? ViewOpenRecordIn.SIDE_PANEL
          : ViewOpenRecordIn.RECORD_PAGE,
      kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId,
      workspaceId,
      anyFieldFilterValue: null,
    }),
  );

  const viewRepository = queryRunner.manager.getRepository(View);
  const createdViews = await viewRepository.save(coreViews);

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      const coreViewFields: Partial<ViewField>[] = viewDefinition.fields.map(
        (field) => ({
          fieldMetadataId: field.fieldMetadataId,
          position: field.position,
          isVisible: field.isVisible,
          size: field.size,
          viewId: viewDefinition.id,
          workspaceId,
        }),
      );

      const viewFieldRepository = queryRunner.manager.getRepository(ViewField);

      await viewFieldRepository.save(coreViewFields);
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      const coreViewFilters: Partial<ViewFilter>[] = viewDefinition.filters.map(
        (filter) => ({
          fieldMetadataId: filter.fieldMetadataId,
          viewId: viewDefinition.id,
          operand: convertViewFilterOperandToCoreOperand(
            filter.operand as SharedViewFilterOperand,
          ),
          value: filter.value,
          workspaceId,
        }),
      );

      const viewFilterRepository =
        queryRunner.manager.getRepository(ViewFilter);

      await viewFilterRepository.save(coreViewFilters);
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      const coreViewGroups: Partial<ViewGroup>[] = viewDefinition.groups.map(
        (group) => ({
          fieldMetadataId: group.fieldMetadataId,
          isVisible: group.isVisible,
          fieldValue: group.fieldValue,
          position: group.position,
          viewId: viewDefinition.id,
          workspaceId,
        }),
      );

      const viewGroupRepository = queryRunner.manager.getRepository(ViewGroup);

      await viewGroupRepository.save(coreViewGroups);
    }
  }

  return createdViews;
};
