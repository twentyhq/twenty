import { type OwnershipSourceFlatEntityMaps } from 'src/engine/metadata-modules/metadata-ownership/types/ownership-source-flat-entity-maps.type';
import { buildMetadataOwnershipIndex } from 'src/engine/metadata-modules/metadata-ownership/utils/build-metadata-ownership-index.util';

const OWNER_USER_WORKSPACE_ID = 'owner-user-workspace-id';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace-id';

const buildFlatEntityMaps = (
  rows: { id: string; [property: string]: unknown }[],
): OwnershipSourceFlatEntityMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    rows.map((row) => [`${row.id}-universal-identifier`, row]),
  ),
});

describe('buildMetadataOwnershipIndex', () => {
  it('indexes private roots by owner and leaves workspace roots out', () => {
    const metadataOwnershipIndex = buildMetadataOwnershipIndex({
      rootMetadataName: 'workflow',
      rootFlatEntityMaps: buildFlatEntityMaps([
        {
          id: 'workspace-workflow',
          visibility: 'WORKSPACE',
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
        {
          id: 'private-workflow-1',
          visibility: 'PRIVATE',
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
        {
          id: 'private-workflow-2',
          visibility: 'PRIVATE',
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
        {
          id: 'other-private-workflow',
          visibility: 'PRIVATE',
          createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
        },
      ]),
      childFlatEntityMapsByMetadataName: {
        workflowVersion: buildFlatEntityMaps([]),
      },
    });

    expect(metadataOwnershipIndex).toEqual({
      ownerUserWorkspaceIdByPrivateRootId: {
        'private-workflow-1': OWNER_USER_WORKSPACE_ID,
        'private-workflow-2': OWNER_USER_WORKSPACE_ID,
        'other-private-workflow': OTHER_USER_WORKSPACE_ID,
      },
      privateRootIdsByOwnerUserWorkspaceId: {
        [OWNER_USER_WORKSPACE_ID]: ['private-workflow-1', 'private-workflow-2'],
        [OTHER_USER_WORKSPACE_ID]: ['other-private-workflow'],
      },
      ownerUserWorkspaceIdByPrivateChildId: {},
    });
  });

  it('records a private root with no owner as owned by nobody', () => {
    const metadataOwnershipIndex = buildMetadataOwnershipIndex({
      rootMetadataName: 'workflow',
      rootFlatEntityMaps: buildFlatEntityMaps([
        {
          id: 'ownerless-workflow',
          visibility: 'PRIVATE',
          createdByUserWorkspaceId: null,
        },
      ]),
      childFlatEntityMapsByMetadataName: {
        workflowVersion: buildFlatEntityMaps([
          { id: 'ownerless-version', coreWorkflowId: 'ownerless-workflow' },
        ]),
      },
    });

    expect(metadataOwnershipIndex).toEqual({
      ownerUserWorkspaceIdByPrivateRootId: { 'ownerless-workflow': null },
      privateRootIdsByOwnerUserWorkspaceId: {},
      ownerUserWorkspaceIdByPrivateChildId: { 'ownerless-version': null },
    });
  });

  it('gives a child the owner of its private root and leaves children of workspace roots out', () => {
    const metadataOwnershipIndex = buildMetadataOwnershipIndex({
      rootMetadataName: 'view',
      rootFlatEntityMaps: buildFlatEntityMaps([
        {
          id: 'workspace-view',
          visibility: 'WORKSPACE',
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
        {
          id: 'private-view',
          visibility: 'UNLISTED',
          createdByUserWorkspaceId: OWNER_USER_WORKSPACE_ID,
        },
      ]),
      childFlatEntityMapsByMetadataName: {
        viewField: buildFlatEntityMaps([
          { id: 'workspace-view-field', viewId: 'workspace-view' },
          { id: 'private-view-field', viewId: 'private-view' },
        ]),
        viewFilter: buildFlatEntityMaps([
          { id: 'private-view-filter', viewId: 'private-view' },
        ]),
        viewSort: buildFlatEntityMaps([
          { id: 'private-view-sort', viewId: 'private-view' },
        ]),
        viewGroup: buildFlatEntityMaps([
          { id: 'private-view-group', viewId: 'private-view' },
        ]),
        viewFilterGroup: buildFlatEntityMaps([
          { id: 'private-view-filter-group', viewId: 'private-view' },
        ]),
        viewFieldGroup: buildFlatEntityMaps([
          { id: 'private-view-field-group', viewId: 'private-view' },
        ]),
      },
    });

    expect(metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId).toEqual(
      {
        'private-view-field': OWNER_USER_WORKSPACE_ID,
        'private-view-filter': OWNER_USER_WORKSPACE_ID,
        'private-view-sort': OWNER_USER_WORKSPACE_ID,
        'private-view-group': OWNER_USER_WORKSPACE_ID,
        'private-view-filter-group': OWNER_USER_WORKSPACE_ID,
        'private-view-field-group': OWNER_USER_WORKSPACE_ID,
      },
    );
  });

  it('records a child whose root is missing as owned by nobody', () => {
    const metadataOwnershipIndex = buildMetadataOwnershipIndex({
      rootMetadataName: 'workflow',
      rootFlatEntityMaps: buildFlatEntityMaps([]),
      childFlatEntityMapsByMetadataName: {
        workflowVersion: buildFlatEntityMaps([
          { id: 'dangling-version', coreWorkflowId: 'deleted-workflow' },
          { id: 'rootless-version', coreWorkflowId: null },
        ]),
      },
    });

    expect(metadataOwnershipIndex.ownerUserWorkspaceIdByPrivateChildId).toEqual(
      { 'dangling-version': null, 'rootless-version': null },
    );
  });
});
