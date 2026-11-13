import { type AllMetadataName } from 'twenty-shared/metadata';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { getInvalidatedVisibilityScopeByFlatEntityMapsKey } from 'src/engine/metadata-modules/metadata-ownership/utils/get-invalidated-visibility-scope-by-flat-entity-maps-key.util';
import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';

const buildFlatView = ({
  id,
  visibility,
}: {
  id: string;
  visibility: ViewVisibility;
}) =>
  ({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    visibility,
    createdByUserWorkspaceId: 'owner-user-workspace-id',
  }) as FlatView;

const buildFlatViewMaps = (
  flatViews: FlatView[],
): FlatEntityMaps<FlatView> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatViews.map((flatView) => [flatView.universalIdentifier, flatView]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatViews.map((flatView) => [flatView.id, flatView.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildMetadataEvent = (metadataEvent: {
  metadataName: AllMetadataName;
  type: MetadataEvent['type'];
  properties: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
}) =>
  ({
    ...metadataEvent,
    recordId: 'record-id',
  }) as unknown as MetadataEvent;

const privateView = buildFlatView({
  id: 'private-view',
  visibility: ViewVisibility.UNLISTED,
});
const workspaceView = buildFlatView({
  id: 'workspace-view',
  visibility: ViewVisibility.WORKSPACE,
});
const allFlatEntityMaps = {
  flatViewMaps: buildFlatViewMaps([privateView, workspaceView]),
};

const VIEW_FAMILY_FLAT_ENTITY_MAPS_KEYS = [
  'flatViewMaps',
  'flatViewFieldMaps',
  'flatViewFilterMaps',
  'flatViewSortMaps',
  'flatViewGroupMaps',
  'flatViewFilterGroupMaps',
  'flatViewFieldGroupMaps',
] as const;

const getScopes = (metadataEvents: MetadataEvent[]) =>
  getInvalidatedVisibilityScopeByFlatEntityMapsKey({
    metadataEvents,
    fromAllFlatEntityMaps: allFlatEntityMaps,
    toAllFlatEntityMaps: allFlatEntityMaps,
  });

describe('getInvalidatedVisibilityScopeByFlatEntityMapsKey', () => {
  it('reports nothing when no ownable metadata is touched', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'objectMetadata',
          type: 'created',
          properties: { after: { id: 'object-id' } },
        }),
      ]),
    ).toEqual({});
  });

  it('reports the scope of a root on every cache key of its family', () => {
    const scopes = getScopes([
      buildMetadataEvent({
        metadataName: 'view',
        type: 'deleted',
        properties: { before: privateView },
      }),
    ]);

    expect(scopes).toEqual(
      Object.fromEntries(
        VIEW_FAMILY_FLAT_ENTITY_MAPS_KEYS.map((flatEntityMapsKey) => [
          flatEntityMapsKey,
          'private',
        ]),
      ),
    );
  });

  it('reports both when a root changes visibility', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'view',
          type: 'updated',
          properties: {
            before: privateView,
            after: { ...privateView, visibility: ViewVisibility.WORKSPACE },
          },
        }),
      ]).flatViewMaps,
    ).toBe('both');
  });

  it('gives a child the scope of its root', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'viewField',
          type: 'created',
          properties: { after: { id: 'view-field', viewId: privateView.id } },
        }),
      ]).flatViewFieldMaps,
    ).toBe('private');
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'viewFilter',
          type: 'created',
          properties: {
            after: { id: 'view-filter', viewId: workspaceView.id },
          },
        }),
      ]).flatViewFilterMaps,
    ).toBe('workspace');
  });

  it('reports both when one migration touches private and workspace rows', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'viewField',
          type: 'created',
          properties: { after: { id: 'view-field', viewId: privateView.id } },
        }),
        buildMetadataEvent({
          metadataName: 'viewSort',
          type: 'deleted',
          properties: {
            before: { id: 'view-sort', viewId: workspaceView.id },
          },
        }),
      ]).flatViewMaps,
    ).toBe('both');
  });

  it('counts a child whose root is missing as private', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'viewSort',
          type: 'deleted',
          properties: { before: { id: 'view-sort', viewId: 'deleted-view' } },
        }),
      ]).flatViewSortMaps,
    ).toBe('private');
  });

  it('records a child as unknown when the root map is not loaded', () => {
    expect(
      getInvalidatedVisibilityScopeByFlatEntityMapsKey({
        metadataEvents: [
          buildMetadataEvent({
            metadataName: 'viewField',
            type: 'created',
            properties: {
              after: { id: 'view-field', viewId: privateView.id },
            },
          }),
        ],
        fromAllFlatEntityMaps: {},
        toAllFlatEntityMaps: {},
      }),
    ).toEqual(
      Object.fromEntries(
        VIEW_FAMILY_FLAT_ENTITY_MAPS_KEYS.map((flatEntityMapsKey) => [
          flatEntityMapsKey,
          'unknown',
        ]),
      ),
    );
  });

  it('records a workflow version saved on its own as unknown, since the migration loads no workflow map', () => {
    expect(
      getInvalidatedVisibilityScopeByFlatEntityMapsKey({
        metadataEvents: [
          buildMetadataEvent({
            metadataName: 'workflowVersion',
            type: 'updated',
            properties: {
              before: { id: 'workflow-version', coreWorkflowId: 'workflow' },
              after: { id: 'workflow-version', coreWorkflowId: 'workflow' },
            },
          }),
        ],
        fromAllFlatEntityMaps: {},
        toAllFlatEntityMaps: {},
      }),
    ).toEqual({
      flatWorkflowMaps: 'unknown',
      flatWorkflowVersionMaps: 'unknown',
    });
  });

  it('prefers a resolved privacy over an unknown one in the same migration', () => {
    expect(
      getScopes([
        buildMetadataEvent({
          metadataName: 'view',
          type: 'deleted',
          properties: { before: privateView },
        }),
        buildMetadataEvent({
          metadataName: 'viewField',
          type: 'created',
          properties: { after: { id: 'view-field', viewId: privateView.id } },
        }),
      ]).flatViewMaps,
    ).toBe('private');
  });

  it('keeps the view and workflow families apart', () => {
    const scopes = getScopes([
      buildMetadataEvent({
        metadataName: 'workflow',
        type: 'created',
        properties: {
          after: { id: 'workflow', visibility: WorkflowVisibility.WORKSPACE },
        },
      }),
    ]);

    expect(scopes).toEqual({
      flatWorkflowMaps: 'workspace',
      flatWorkflowVersionMaps: 'workspace',
    });
  });
});
