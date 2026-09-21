import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { computeOrderedMigrationActions } from 'src/engine/workspace-manager/workspace-migration/utils/compute-ordered-migration-actions.util';
import { type UniversalCreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type UniversalCreatePageLayoutAction,
  type UniversalUpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';

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
});
