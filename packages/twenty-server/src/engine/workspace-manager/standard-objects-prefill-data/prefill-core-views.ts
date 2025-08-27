import { isString } from '@sniptt/guards';
import { type ViewFilterOperand as SharedViewFilterOperand } from 'twenty-shared/types';
import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/core-modules/view/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/core-modules/view/entities/view-group.entity';
import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/core-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { dashboardsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/dashboards-all.view';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesTableByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-table-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';
import { convertViewFilterOperandToCoreOperand } from 'src/modules/view/utils/convert-view-filter-operand-to-core-operand.util';

export const prefillCoreViews = async (
  coreDataSource: DataSource,
  workspaceId: string,
  objectMetadataItems: ObjectMetadataEntity[],
  featureFlags?: Record<string, boolean>,
): Promise<ViewEntity[]> => {
  const views = [
    companiesAllView(objectMetadataItems, true),
    peopleAllView(objectMetadataItems, true),
    opportunitiesAllView(objectMetadataItems, true),
    opportunitiesTableByStageView(objectMetadataItems, true),
    notesAllView(objectMetadataItems, true),
    tasksAllView(objectMetadataItems, true),
    tasksAssignedToMeView(objectMetadataItems, true),
    tasksByStatusView(objectMetadataItems, true),
    workflowsAllView(objectMetadataItems, true),
    workflowVersionsAllView(objectMetadataItems, true),
    workflowRunsAllView(objectMetadataItems, true),
  ];

  if (featureFlags?.[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED]) {
    views.push(dashboardsAllView(objectMetadataItems, true));
  }

  const queryRunner = coreDataSource.createQueryRunner();

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
): Promise<ViewEntity[]> => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  const coreViews: Partial<ViewEntity>[] = viewDefinitionsWithId.map(
    ({
      id,
      name,
      objectMetadataId,
      type,
      key,
      position,
      icon,
      isCustom,
      openRecordIn,
      kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId,
    }) => ({
      id,
      name: isString(name) ? name : name.message || '',
      objectMetadataId,
      type: type === 'kanban' ? ViewType.KANBAN : ViewType.TABLE,
      key: key === ViewKey.INDEX ? ViewKey.INDEX : null,
      position,
      icon,
      isCompact: false,
      isCustom: isCustom ?? false,
      openRecordIn:
        openRecordIn === ViewOpenRecordInType.RECORD_PAGE
          ? ViewOpenRecordIn.RECORD_PAGE
          : ViewOpenRecordIn.SIDE_PANEL,
      kanbanAggregateOperation,
      kanbanAggregateOperationFieldMetadataId,
      workspaceId,
      anyFieldFilterValue: null,
    }),
  );

  const viewRepository = queryRunner.manager.getRepository(ViewEntity);
  const createdViews = await viewRepository.save(coreViews);

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      const coreViewFields: Partial<ViewFieldEntity>[] =
        viewDefinition.fields.map((field) => ({
          fieldMetadataId: field.fieldMetadataId,
          position: field.position,
          isVisible: field.isVisible,
          size: field.size,
          viewId: viewDefinition.id,
          workspaceId,
        }));

      const viewFieldRepository =
        queryRunner.manager.getRepository(ViewFieldEntity);

      await viewFieldRepository.save(coreViewFields);
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      const coreViewFilters: Partial<ViewFilterEntity>[] =
        viewDefinition.filters.map((filter) => ({
          fieldMetadataId: filter.fieldMetadataId,
          viewId: viewDefinition.id,
          operand: convertViewFilterOperandToCoreOperand(
            filter.operand as SharedViewFilterOperand,
          ),
          value: filter.value,
          workspaceId,
        }));

      const viewFilterRepository =
        queryRunner.manager.getRepository(ViewFilterEntity);

      await viewFilterRepository.save(coreViewFilters);
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      const coreViewGroups: Partial<ViewGroupEntity>[] =
        viewDefinition.groups.map((group) => ({
          fieldMetadataId: group.fieldMetadataId,
          isVisible: group.isVisible,
          fieldValue: group.fieldValue,
          position: group.position,
          viewId: viewDefinition.id,
          workspaceId,
        }));

      const viewGroupRepository =
        queryRunner.manager.getRepository(ViewGroupEntity);

      await viewGroupRepository.save(coreViewGroups);
    }
  }

  return createdViews;
};
