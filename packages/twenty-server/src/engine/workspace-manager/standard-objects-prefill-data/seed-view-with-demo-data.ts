import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
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

export const seedViewWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  const viewDefinitions = [
    companiesAllView(objectMetadataStandardIdToIdMap),
    peopleAllView(objectMetadataStandardIdToIdMap),
    opportunitiesAllView(objectMetadataStandardIdToIdMap),
    opportunitiesByStageView(objectMetadataStandardIdToIdMap),
    notesAllView(objectMetadataStandardIdToIdMap),
    tasksAllView(objectMetadataStandardIdToIdMap),
    tasksAssignedToMeView(objectMetadataStandardIdToIdMap),
    tasksByStatusView(objectMetadataStandardIdToIdMap),
    workflowsAllView(objectMetadataStandardIdToIdMap),
    workflowVersionsAllView(objectMetadataStandardIdToIdMap),
    workflowRunsAllView(objectMetadataStandardIdToIdMap),
  ];

  return createWorkspaceViews(entityManager, schemaName, viewDefinitions);
};
