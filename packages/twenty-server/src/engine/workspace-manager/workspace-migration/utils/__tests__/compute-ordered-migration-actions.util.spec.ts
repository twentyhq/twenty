import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
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

describe('computeOrderedMigrationActions', () => {
  it('should run pageLayout updates after pageLayoutTab creates so defaultTabToFocusOnMobileAndSidePanel can reference a tab created in the same migration', () => {
    const pageLayoutUpdateAction = {
      type: 'update',
      metadataName: 'pageLayout',
      universalIdentifier: 'layout',
      update: {
        defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: 'tab',
      },
    } as unknown as UniversalUpdatePageLayoutAction;
    const pageLayoutTabCreateAction = {
      type: 'create',
      metadataName: 'pageLayoutTab',
      flatEntity: {
        universalIdentifier: 'tab',
        pageLayoutUniversalIdentifier: 'layout',
      },
    } as unknown as UniversalCreatePageLayoutTabAction;

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
    const oldFrontComponentDeleteAction = {
      type: 'delete',
      metadataName: 'frontComponent',
      universalIdentifier: 'component-a',
    } as unknown as UniversalDeleteFrontComponentAction;
    const newFrontComponentCreateAction = {
      type: 'create',
      metadataName: 'frontComponent',
      flatEntity: { universalIdentifier: 'component-b' },
    } as unknown as UniversalCreateFrontComponentAction;
    const retainedItemUpdateAction = {
      type: 'update',
      metadataName: 'settingsMenuItem',
      universalIdentifier: 'item-kept',
      update: { frontComponentUniversalIdentifier: 'component-b' },
    } as unknown as UniversalUpdateSettingsMenuItemAction;
    const droppedItemDeleteAction = {
      type: 'delete',
      metadataName: 'settingsMenuItem',
      universalIdentifier: 'item-dropped',
    } as unknown as UniversalDeleteSettingsMenuItemAction;

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

  it('should run pageLayout creates before pageLayoutTab creates', () => {
    const pageLayoutCreateAction = {
      type: 'create',
      metadataName: 'pageLayout',
      flatEntity: { universalIdentifier: 'layout' },
    } as unknown as UniversalCreatePageLayoutAction;
    const pageLayoutTabCreateAction = {
      type: 'create',
      metadataName: 'pageLayoutTab',
      flatEntity: {
        universalIdentifier: 'tab',
        pageLayoutUniversalIdentifier: 'layout',
      },
    } as unknown as UniversalCreatePageLayoutTabAction;

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
