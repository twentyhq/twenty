import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { ViewSortDirection } from 'twenty-shared/types';

import { WorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { buildUniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout.test-util';
import { buildUniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/utils/__tests__/build-universal-flat-page-layout-tab.test-util';
import { computeOrderedMigrationActions } from 'src/engine/workspace-manager/workspace-migration/utils/compute-ordered-migration-actions.util';
import {
  type UniversalCreateFrontComponentAction,
  type UniversalDeleteFrontComponentAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/front-component/types/workspace-migration-front-component-action.type';
import { type UniversalCreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type UniversalCreatePageLayoutAction,
  type UniversalUpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  type UniversalDeleteSettingsMenuItemAction,
  type UniversalUpdateSettingsMenuItemAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/settings-menu-item/types/workspace-migration-settings-menu-item-action.type';
import { type UniversalCreateViewSortAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-sort/types/workspace-migration-view-sort-action.type';
import {
  type UniversalCreateWorkflowVersionAction,
  type UniversalUpdateWorkflowVersionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow-version/types/workspace-migration-workflow-version-action.type';

describe('computeOrderedMigrationActions', () => {
  it('should remove a replaced view sort before creating its replacement', () => {
    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();
    const oldSortDeleteAction = {
      type: 'delete',
      metadataName: 'viewSort',
      universalIdentifier: 'old-sort',
    } as const;
    const replacementSortCreateAction: UniversalCreateViewSortAction = {
      type: 'create',
      metadataName: 'viewSort',
      flatEntity: {
        universalIdentifier: 'replacement-sort',
        viewUniversalIdentifier: 'view',
        fieldMetadataUniversalIdentifier: 'field',
        applicationUniversalIdentifier: 'application',
        direction: ViewSortDirection.ASC,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };

    orchestratorActionsReport.viewSort.delete.push(oldSortDeleteAction);
    orchestratorActionsReport.viewSort.create.push(replacementSortCreateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(oldSortDeleteAction)).toBeLessThan(
      orderedActions.indexOf(replacementSortCreateAction),
    );
  });

  it('should run pageLayout updates after pageLayoutTab creates so defaultTabToFocusOnMobileAndSidePanel can reference a tab created in the same migration', () => {
    const pageLayoutUpdateAction: UniversalUpdatePageLayoutAction = {
      type: 'update',
      metadataName: 'pageLayout',
      universalIdentifier: 'layout',
      update: {
        defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: 'tab',
      },
    };
    const pageLayoutTabCreateAction: UniversalCreatePageLayoutTabAction = {
      type: 'create',
      metadataName: 'pageLayoutTab',
      flatEntity: buildUniversalFlatPageLayoutTab({
        universalIdentifier: 'tab',
        pageLayoutUniversalIdentifier: 'layout',
      }),
    };

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.pageLayout.update.push(pageLayoutUpdateAction);
    orchestratorActionsReport.pageLayoutTab.create.push(
      pageLayoutTabCreateAction,
    );

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(pageLayoutTabCreateAction)).toBeLessThan(
      orderedActions.indexOf(pageLayoutUpdateAction),
    );
  });

  // settingsMenuItem.frontComponentId is ON DELETE CASCADE, so a sync that repoints
  // an item onto a new component while dropping the old one loses the row unless the
  // update lands first — the update would then match nothing and still report success.
  it('should repoint settings menu items and delete removed ones around the front component delete', () => {
    const oldFrontComponentDeleteAction: UniversalDeleteFrontComponentAction = {
      type: 'delete',
      metadataName: 'frontComponent',
      universalIdentifier: 'component-a',
    };
    const newFrontComponentCreateAction: UniversalCreateFrontComponentAction = {
      type: 'create',
      metadataName: 'frontComponent',
      flatEntity: {
        universalIdentifier: 'component-b',
        applicationUniversalIdentifier: 'application',
        name: 'Component',
        description: null,
        sourceComponentPath: 'component.tsx',
        builtComponentPath: 'component.js',
        componentName: 'Component',
        builtComponentChecksum: 'checksum',
        isHeadless: false,
        usesSdkClient: false,
        universalWidgetAvailability: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    const retainedItemUpdateAction: UniversalUpdateSettingsMenuItemAction = {
      type: 'update',
      metadataName: 'settingsMenuItem',
      universalIdentifier: 'item-kept',
      update: { frontComponentUniversalIdentifier: 'component-b' },
    };
    const droppedItemDeleteAction: UniversalDeleteSettingsMenuItemAction = {
      type: 'delete',
      metadataName: 'settingsMenuItem',
      universalIdentifier: 'item-dropped',
    };

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.frontComponent.delete.push(
      oldFrontComponentDeleteAction,
    );
    orchestratorActionsReport.frontComponent.create.push(
      newFrontComponentCreateAction,
    );
    orchestratorActionsReport.settingsMenuItem.update.push(
      retainedItemUpdateAction,
    );
    orchestratorActionsReport.settingsMenuItem.delete.push(
      droppedItemDeleteAction,
    );

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    const frontComponentDeleteIndex = orderedActions.indexOf(
      oldFrontComponentDeleteAction,
    );

    expect(orderedActions.indexOf(newFrontComponentCreateAction)).toBeLessThan(
      orderedActions.indexOf(retainedItemUpdateAction),
    );
    expect(orderedActions.indexOf(retainedItemUpdateAction)).toBeLessThan(
      frontComponentDeleteIndex,
    );
    expect(orderedActions.indexOf(droppedItemDeleteAction)).toBeLessThan(
      frontComponentDeleteIndex,
    );
  });

  it('should archive the active workflow version before creating the one that replaces it', () => {
    const archiveAction: UniversalUpdateWorkflowVersionAction = {
      type: 'update',
      metadataName: 'workflowVersion',
      universalIdentifier: 'published-version',
      update: { status: WorkflowVersionStatus.ARCHIVED },
    };
    const publishAction: UniversalCreateWorkflowVersionAction = {
      type: 'create',
      metadataName: 'workflowVersion',
      flatEntity: {
        universalIdentifier: 'new-version',
        applicationUniversalIdentifier: 'application',
        status: WorkflowVersionStatus.ACTIVE,
        isSystemSideEffect: false,
        triggers: null,
        steps: null,
        workflowId: null,
        coreWorkflowId: null,
        workspaceWorkflowVersionId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    };
    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.workflowVersion.create.push(publishAction);
    orchestratorActionsReport.workflowVersion.update.push(archiveAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(archiveAction)).toBeLessThan(
      orderedActions.indexOf(publishAction),
    );
  });

  it('should run pageLayout creates before pageLayoutTab creates', () => {
    const pageLayoutCreateAction: UniversalCreatePageLayoutAction = {
      type: 'create',
      metadataName: 'pageLayout',
      flatEntity: buildUniversalFlatPageLayout({
        universalIdentifier: 'layout',
      }),
    };
    const pageLayoutTabCreateAction: UniversalCreatePageLayoutTabAction = {
      type: 'create',
      metadataName: 'pageLayoutTab',
      flatEntity: buildUniversalFlatPageLayoutTab({
        universalIdentifier: 'tab',
        pageLayoutUniversalIdentifier: 'layout',
      }),
    };

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.pageLayout.create.push(pageLayoutCreateAction);
    orchestratorActionsReport.pageLayoutTab.create.push(
      pageLayoutTabCreateAction,
    );

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(pageLayoutCreateAction)).toBeLessThan(
      orderedActions.indexOf(pageLayoutTabCreateAction),
    );
  });

  // A child repointed onto another parent is lost to ON DELETE CASCADE when its
  // old parent is deleted first: the update then matches nothing and still
  // reports success. Non-deferrable FKs also need their target created first.
  it.each<{
    title: string;
    earlier: [AllMetadataName, WorkspaceMigrationActionType];
    later: [AllMetadataName, WorkspaceMigrationActionType];
  }>([
    {
      title: 'viewFilterGroup creates before viewFilter updates',
      earlier: ['viewFilterGroup', 'create'],
      later: ['viewFilter', 'update'],
    },
    {
      title: 'viewFilter updates before viewFilterGroup deletes',
      earlier: ['viewFilter', 'update'],
      later: ['viewFilterGroup', 'delete'],
    },
    {
      title: 'viewFilterGroup updates before viewFilterGroup deletes',
      earlier: ['viewFilterGroup', 'update'],
      later: ['viewFilterGroup', 'delete'],
    },
    {
      title: 'pageLayout creates before commandMenuItem creates',
      earlier: ['pageLayout', 'create'],
      later: ['commandMenuItem', 'create'],
    },
    {
      title: 'commandMenuItem updates before pageLayout deletes',
      earlier: ['commandMenuItem', 'update'],
      later: ['pageLayout', 'delete'],
    },
    {
      title: 'pageLayoutWidget updates before pageLayoutTab deletes',
      earlier: ['pageLayoutWidget', 'update'],
      later: ['pageLayoutTab', 'delete'],
    },
    {
      title: 'pageLayoutWidget updates before pageLayout deletes',
      earlier: ['pageLayoutWidget', 'update'],
      later: ['pageLayout', 'delete'],
    },
    {
      title: 'navigationMenuItem updates before navigationMenuItem deletes',
      earlier: ['navigationMenuItem', 'update'],
      later: ['navigationMenuItem', 'delete'],
    },
    {
      title:
        'rowLevelPermissionPredicateGroup creates before rowLevelPermissionPredicate updates',
      earlier: ['rowLevelPermissionPredicateGroup', 'create'],
      later: ['rowLevelPermissionPredicate', 'update'],
    },
    {
      title:
        'rowLevelPermissionPredicate updates before rowLevelPermissionPredicateGroup deletes',
      earlier: ['rowLevelPermissionPredicate', 'update'],
      later: ['rowLevelPermissionPredicateGroup', 'delete'],
    },
    {
      title:
        'rowLevelPermissionPredicateGroup updates before rowLevelPermissionPredicateGroup deletes',
      earlier: ['rowLevelPermissionPredicateGroup', 'update'],
      later: ['rowLevelPermissionPredicateGroup', 'delete'],
    },
  ])('should run $title', ({ earlier, later }) => {
    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();
    const [earlierAction, laterAction] = [earlier, later].map(
      ([metadataName, actionType]) => {
        const sentinel = { type: actionType, metadataName };

        (orchestratorActionsReport[metadataName][actionType] as object[]).push(
          sentinel,
        );

        return sentinel;
      },
    );

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    ) as object[];

    expect(orderedActions.indexOf(earlierAction)).toBeLessThan(
      orderedActions.indexOf(laterAction),
    );
  });

  // The ordered list is written by hand and OrchestratorActionsReport is a
  // mapped type, so reading fewer keys than it holds type-checks: a metadata
  // name left out here has its actions built, validated, then silently dropped
  // before the runner ever sees them.
  it('should emit the actions of every metadata name', () => {
    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();
    const sentinelByKey = new Map<string, object>();

    for (const metadataName of Object.values(ALL_METADATA_NAME)) {
      for (const actionType of ['create', 'update', 'delete'] as const) {
        const sentinel = { type: actionType, metadataName };

        sentinelByKey.set(`${metadataName}.${actionType}`, sentinel);
        (orchestratorActionsReport[metadataName][actionType] as object[]).push(
          sentinel,
        );
      }
    }

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    const droppedKeys = [...sentinelByKey.entries()]
      .filter(([, sentinel]) => !orderedActions.includes(sentinel as never))
      .map(([key]) => key);

    expect(droppedKeys).toEqual([]);
  });
});
