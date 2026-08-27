import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { enrichCreateWorkspaceMigrationActionsWithIds } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import { type UniversalCreatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action.type';
import { type UniversalCreatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/page-layout/types/workspace-migration-page-layout-action.type';
import { type WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration.type';
import { buildPreallocatedIdByUniversalIdentifierFromActions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/build-preallocated-id-by-universal-identifier-from-actions.util';

const buildCreatePageLayoutAction = ({
  pageLayoutUniversalIdentifier,
  defaultTabUniversalIdentifier,
}: {
  pageLayoutUniversalIdentifier: string;
  defaultTabUniversalIdentifier?: string;
}): UniversalCreatePageLayoutAction =>
  ({
    type: 'create',
    metadataName: 'pageLayout',
    flatEntity: {
      universalIdentifier: pageLayoutUniversalIdentifier,
      defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
        defaultTabUniversalIdentifier ?? null,
    },
  }) as unknown as UniversalCreatePageLayoutAction;

const buildCreatePageLayoutTabAction = ({
  tabUniversalIdentifier,
  pageLayoutUniversalIdentifier,
}: {
  tabUniversalIdentifier: string;
  pageLayoutUniversalIdentifier: string;
}): UniversalCreatePageLayoutTabAction =>
  ({
    type: 'create',
    metadataName: 'pageLayoutTab',
    flatEntity: {
      universalIdentifier: tabUniversalIdentifier,
      pageLayoutUniversalIdentifier,
    },
  }) as unknown as UniversalCreatePageLayoutTabAction;

const buildWorkspaceMigration = (
  actions: (
    | UniversalCreatePageLayoutAction
    | UniversalCreatePageLayoutTabAction
  )[],
): WorkspaceMigration =>
  ({
    applicationUniversalIdentifier: 'app',
    actions,
  }) as unknown as WorkspaceMigration;

const EMPTY_FLAT_PAGE_LAYOUT_TAB_MAPS = {
  byUniversalIdentifier: {},
} as unknown as AllFlatEntityMaps['flatPageLayoutTabMaps'];

describe('buildPreallocatedIdByUniversalIdentifierFromActions', () => {
  it('should preallocate the id of every enriched create action', () => {
    const workspaceMigration = enrichCreateWorkspaceMigrationActionsWithIds({
      workspaceMigration: buildWorkspaceMigration([
        buildCreatePageLayoutAction({
          pageLayoutUniversalIdentifier: 'layout',
        }),
        buildCreatePageLayoutTabAction({
          tabUniversalIdentifier: 'tab',
          pageLayoutUniversalIdentifier: 'layout',
        }),
      ]),
      idByUniversalIdentifierByMetadataName: {},
    });

    const preallocatedIdByUniversalIdentifierByMetadataName =
      buildPreallocatedIdByUniversalIdentifierFromActions(
        workspaceMigration.actions,
      );

    const [enrichedPageLayoutAction, enrichedPageLayoutTabAction] =
      workspaceMigration.actions as [
        UniversalCreatePageLayoutAction,
        UniversalCreatePageLayoutTabAction,
      ];

    expect(
      preallocatedIdByUniversalIdentifierByMetadataName.pageLayout?.layout,
    ).toBe(enrichedPageLayoutAction.id);
    expect(
      preallocatedIdByUniversalIdentifierByMetadataName.pageLayoutTab?.tab,
    ).toBe(enrichedPageLayoutTabAction.id);
  });

  it('should let a pageLayout create resolve its default tab to the id of a tab created in the same migration', () => {
    const workspaceMigration = enrichCreateWorkspaceMigrationActionsWithIds({
      workspaceMigration: buildWorkspaceMigration([
        buildCreatePageLayoutAction({
          pageLayoutUniversalIdentifier: 'layout',
          defaultTabUniversalIdentifier: 'tab',
        }),
        buildCreatePageLayoutTabAction({
          tabUniversalIdentifier: 'tab',
          pageLayoutUniversalIdentifier: 'layout',
        }),
      ]),
      idByUniversalIdentifierByMetadataName: {},
    });

    const [enrichedPageLayoutAction, enrichedPageLayoutTabAction] =
      workspaceMigration.actions as [
        UniversalCreatePageLayoutAction,
        UniversalCreatePageLayoutTabAction,
      ];

    const { defaultTabToFocusOnMobileAndSidePanelId } =
      resolveUniversalRelationIdentifiersToIds<
        'pageLayout',
        'defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier'
      >({
        flatEntityMaps: {
          flatPageLayoutTabMaps: EMPTY_FLAT_PAGE_LAYOUT_TAB_MAPS,
        },
        metadataName: 'pageLayout',
        universalForeignKeyValues: {
          defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
            enrichedPageLayoutAction.flatEntity
              .defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier,
        },
        preallocatedIdByUniversalIdentifierByMetadataName:
          buildPreallocatedIdByUniversalIdentifierFromActions(
            workspaceMigration.actions,
          ),
      });

    expect(defaultTabToFocusOnMobileAndSidePanelId).toBe(
      enrichedPageLayoutTabAction.id,
    );
  });
});
