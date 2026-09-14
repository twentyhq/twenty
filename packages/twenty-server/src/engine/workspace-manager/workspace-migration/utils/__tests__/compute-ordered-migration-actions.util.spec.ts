import { isDefined } from 'twenty-shared/utils';

import { createEmptyOrchestratorActionsReport } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-actions-report.constant';
import { computeOrderedMigrationActions } from 'src/engine/workspace-manager/workspace-migration/utils/compute-ordered-migration-actions.util';
import { type UniversalCreateAgentAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/agent/types/workspace-migration-agent-action-builder.service';
import { type UniversalCreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import {
  type UniversalCreatePageLayoutAction,
  type UniversalUpdatePageLayoutAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import {
  type UniversalDeleteRoleTargetAction,
  type UniversalUpdateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  type UniversalCreateRoleAction,
  type UniversalDeleteRoleAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';

const buildRoleDeleteAction = ({
  label,
}: {
  label?: string;
}): UniversalDeleteRoleAction =>
  ({
    type: 'delete',
    metadataName: 'role',
    universalIdentifier: 'dropped-role',
    ...(isDefined(label)
      ? { flatEntity: { universalIdentifier: 'dropped-role', label } }
      : {}),
  }) as unknown as UniversalDeleteRoleAction;

const buildRoleCreateAction = ({
  universalIdentifier,
  label,
}: {
  universalIdentifier: string;
  label: string;
}): UniversalCreateRoleAction =>
  ({
    type: 'create',
    metadataName: 'role',
    flatEntity: { universalIdentifier, label },
  }) as unknown as UniversalCreateRoleAction;

const buildRoleTargetUpdateAction = (
  update: Record<string, string>,
): UniversalUpdateRoleTargetAction =>
  ({
    type: 'update',
    metadataName: 'roleTarget',
    universalIdentifier: 'target',
    update,
  }) as unknown as UniversalUpdateRoleTargetAction;

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

  it('should run a role-only role target repoint at a pre-existing role before role deletes so the role cascade cannot remove the role target first', () => {
    const roleDeleteAction = buildRoleDeleteAction({ label: 'Dropped' });
    const roleTargetUpdateAction = buildRoleTargetUpdateAction({
      roleUniversalIdentifier: 'default-role',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.role.delete.push(roleDeleteAction);
    orchestratorActionsReport.roleTarget.update.push(roleTargetUpdateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(roleTargetUpdateAction)).toBeLessThan(
      orderedActions.indexOf(roleDeleteAction),
    );
  });

  it('should run a role create whose label no deleted role uses, and a role target repoint at it, before role deletes', () => {
    const roleDeleteAction = buildRoleDeleteAction({ label: 'Dropped' });
    const roleCreateAction = buildRoleCreateAction({
      universalIdentifier: 'replacement-role',
      label: 'Replacement',
    });
    const roleTargetUpdateAction = buildRoleTargetUpdateAction({
      roleUniversalIdentifier: 'replacement-role',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.role.delete.push(roleDeleteAction);
    orchestratorActionsReport.role.create.push(roleCreateAction);
    orchestratorActionsReport.roleTarget.update.push(roleTargetUpdateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(roleCreateAction)).toBeLessThan(
      orderedActions.indexOf(roleTargetUpdateAction),
    );
    expect(orderedActions.indexOf(roleTargetUpdateAction)).toBeLessThan(
      orderedActions.indexOf(roleDeleteAction),
    );
  });

  it('should run a role create that reuses a deleted role label after the role delete, and a role target repoint at it after both', () => {
    const roleDeleteAction = buildRoleDeleteAction({ label: 'Support' });
    const roleCreateAction = buildRoleCreateAction({
      universalIdentifier: 'recreated-role',
      label: 'Support',
    });
    const roleTargetUpdateAction = buildRoleTargetUpdateAction({
      roleUniversalIdentifier: 'recreated-role',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.role.delete.push(roleDeleteAction);
    orchestratorActionsReport.role.create.push(roleCreateAction);
    orchestratorActionsReport.roleTarget.update.push(roleTargetUpdateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(roleDeleteAction)).toBeLessThan(
      orderedActions.indexOf(roleCreateAction),
    );
    expect(orderedActions.indexOf(roleCreateAction)).toBeLessThan(
      orderedActions.indexOf(roleTargetUpdateAction),
    );
  });

  it('should keep every role create after role deletes when a role delete does not carry its label', () => {
    const roleDeleteAction = buildRoleDeleteAction({});
    const roleCreateAction = buildRoleCreateAction({
      universalIdentifier: 'replacement-role',
      label: 'Replacement',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.role.delete.push(roleDeleteAction);
    orchestratorActionsReport.role.create.push(roleCreateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(roleDeleteAction)).toBeLessThan(
      orderedActions.indexOf(roleCreateAction),
    );
  });

  it('should run a role target update that changes its agent after agent creates', () => {
    const agentCreateAction = {
      type: 'create',
      metadataName: 'agent',
      flatEntity: { universalIdentifier: 'new-agent' },
    } as unknown as UniversalCreateAgentAction;
    const roleTargetUpdateAction = buildRoleTargetUpdateAction({
      roleUniversalIdentifier: 'existing-role',
      agentUniversalIdentifier: 'new-agent',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.agent.create.push(agentCreateAction);
    orchestratorActionsReport.roleTarget.update.push(roleTargetUpdateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(agentCreateAction)).toBeLessThan(
      orderedActions.indexOf(roleTargetUpdateAction),
    );
  });

  it('should run a role target update that changes its user workspace after role target deletes', () => {
    const roleTargetDeleteAction = {
      type: 'delete',
      metadataName: 'roleTarget',
      universalIdentifier: 'released-target',
    } as unknown as UniversalDeleteRoleTargetAction;
    const roleTargetUpdateAction = buildRoleTargetUpdateAction({
      roleUniversalIdentifier: 'existing-role',
      userWorkspaceId: 'user-workspace',
    });

    const orchestratorActionsReport = createEmptyOrchestratorActionsReport();

    orchestratorActionsReport.roleTarget.delete.push(roleTargetDeleteAction);
    orchestratorActionsReport.roleTarget.update.push(roleTargetUpdateAction);

    const orderedActions = computeOrderedMigrationActions(
      orchestratorActionsReport,
    );

    expect(orderedActions.indexOf(roleTargetDeleteAction)).toBeLessThan(
      orderedActions.indexOf(roleTargetUpdateAction),
    );
  });
});
