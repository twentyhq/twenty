import { isString } from '@sniptt/guards';
import { type DataSource, type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewOpenRecordInType } from 'src/engine/metadata-modules/view/types/view-open-record-in-type.type';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { prefillWorkspaceFavorites } from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-workspace-favorites';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { dashboardsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/dashboards-all.view';
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

type PrefillCoreViewsArgs = {
  coreDataSource: DataSource;
  workspaceId: string;
  objectMetadataItems: ObjectMetadataEntity[];
  featureFlags?: Record<string, boolean>;
  workspaceSchemaName: string;
};

export const prefillCoreViews = async ({
  coreDataSource,
  workspaceId,
  objectMetadataItems,
  workspaceSchemaName,
}: PrefillCoreViewsArgs): Promise<ViewEntity[]> => {
  const views = [
    companiesAllView(objectMetadataItems, true),
    peopleAllView(objectMetadataItems, true),
    opportunitiesAllView(objectMetadataItems, true),
    opportunitiesByStageView(objectMetadataItems, true),
    notesAllView(objectMetadataItems, true),
    tasksAllView(objectMetadataItems, true),
    tasksAssignedToMeView(objectMetadataItems, true),
    tasksByStatusView(objectMetadataItems, true),
    workflowsAllView(objectMetadataItems, true),
    workflowVersionsAllView(objectMetadataItems, true),
    workflowRunsAllView(objectMetadataItems, true),
    dashboardsAllView(objectMetadataItems, true),
  ];

  const queryRunner = coreDataSource.createQueryRunner();

  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const createdViews = await createCoreViews(queryRunner, workspaceId, views);

    await prefillWorkspaceFavorites(
      createdViews
        .filter(
          (view) =>
            view.key === 'INDEX' &&
            shouldSeedWorkspaceFavorite(
              view.objectMetadataId,
              objectMetadataItems,
            ),
        )
        .map((view) => view.id),
      queryRunner.manager as WorkspaceEntityManager,
      workspaceSchemaName,
    );

    await queryRunner.commitTransaction();

    return createdViews;
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      try {
        await queryRunner.rollbackTransaction();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.trace(`Failed to rollback transaction: ${error.message}`);
      }
    }
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const createCoreViews = async (
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
          operand: filter.operand,
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
