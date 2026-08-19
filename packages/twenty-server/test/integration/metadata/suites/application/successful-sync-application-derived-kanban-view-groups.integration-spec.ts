import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, ViewType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const STAGE_FIELD_ID = uuidv4();
const PROJECT_KANBAN_VIEW_ID = uuidv4();
const OPPORTUNITY_KANBAN_VIEW_ID = uuidv4();
const DECLARED_GROUPS_VIEW_ID = uuidv4();
const DECLARED_VIEW_GROUP_ID = uuidv4();

const PROJECT_KANBAN_VIEW_NAME = 'Projects By Stage';
const OPPORTUNITY_KANBAN_VIEW_NAME = 'App Opportunities By Stage';
const DECLARED_GROUPS_VIEW_NAME = 'Projects Curated Board';

const STAGE_OPTION_VALUES = ['TODO', 'DOING', 'DONE'];

const TEST_OBJECT = buildDefaultObjectManifest({
  applicationUniversalIdentifier: TEST_APP_ID,
  nameSingular: 'project',
  namePlural: 'projects',
  labelSingular: 'Project',
  labelPlural: 'Projects',
  description: 'A project',
  icon: 'IconBriefcase',
  additionalFields: [
    {
      universalIdentifier: STAGE_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      type: FieldMetadataType.SELECT,
      options: STAGE_OPTION_VALUES.map((value, position) => ({
        id: uuidv4(),
        label: value,
        value,
        position,
        color: 'blue',
      })),
    },
  ],
});

// The report's exact repro: an app-defined Kanban view declaring only a
// mainGroupByFieldMetadataUniversalIdentifier and no groups.
const buildManifest = (): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [TEST_OBJECT],
      views: [
        {
          universalIdentifier: PROJECT_KANBAN_VIEW_ID,
          name: PROJECT_KANBAN_VIEW_NAME,
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          type: ViewType.KANBAN,
          icon: 'IconLayoutKanban',
          mainGroupByFieldMetadataUniversalIdentifier: STAGE_FIELD_ID,
        },
        {
          universalIdentifier: OPPORTUNITY_KANBAN_VIEW_ID,
          name: OPPORTUNITY_KANBAN_VIEW_NAME,
          objectUniversalIdentifier:
            STANDARD_OBJECTS.opportunity.universalIdentifier,
          type: ViewType.KANBAN,
          icon: 'IconLayoutKanban',
          mainGroupByFieldMetadataUniversalIdentifier:
            STANDARD_OBJECTS.opportunity.fields.stage.universalIdentifier,
        },
        {
          universalIdentifier: DECLARED_GROUPS_VIEW_ID,
          name: DECLARED_GROUPS_VIEW_NAME,
          objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
          type: ViewType.KANBAN,
          icon: 'IconLayoutKanban',
          mainGroupByFieldMetadataUniversalIdentifier: STAGE_FIELD_ID,
          groups: [
            {
              universalIdentifier: DECLARED_VIEW_GROUP_ID,
              fieldValue: 'DONE',
              position: 0,
              isVisible: true,
            },
          ],
        },
      ],
    },
  });

type ViewGroupResponse = {
  id: string;
  fieldValue: string;
  position: number;
  isVisible: boolean;
};

type ViewWithGroupsResponse = {
  id: string;
  name: string;
  viewGroups: ViewGroupResponse[];
};

const VIEW_WITH_GROUPS_GQL_FIELDS = `
  id
  name
  viewGroups { id fieldValue position isVisible }
`;

const findObjectIdByUniversalIdentifier = async (
  objectUniversalIdentifier: string,
) => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: {},
      paging: { first: 1000 },
    },
    gqlFields: 'id universalIdentifier',
    expectToFail: false,
  });

  const objectMetadata = (
    objects as { id: string; universalIdentifier: string }[]
  ).find((object) => object.universalIdentifier === objectUniversalIdentifier);

  if (!objectMetadata) {
    throw new Error(`Object ${objectUniversalIdentifier} not found`);
  }

  return objectMetadata.id;
};

const findViewWithGroupsByName = async ({
  objectMetadataId,
  viewName,
}: {
  objectMetadataId: string;
  viewName: string;
}): Promise<ViewWithGroupsResponse> => {
  const { data } = await findViews({
    objectMetadataId,
    gqlFields: VIEW_WITH_GROUPS_GQL_FIELDS,
    expectToFail: false,
  });

  const view = (
    (data?.getViews ?? []) as unknown as ViewWithGroupsResponse[]
  ).find((candidateView) => candidateView.name === viewName);

  if (!view) {
    throw new Error(`View ${viewName} not found`);
  }

  return view;
};

const sortedGroupsByPosition = (view: ViewWithGroupsResponse) =>
  [...view.viewGroups].sort(
    (firstGroup, secondGroup) => firstGroup.position - secondGroup.position,
  );

describe('Manifest sync - view groups derived from the main group-by field', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing derived kanban view groups',
      sourcePath: 'test-derived-kanban-view-groups',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('derives view groups for group-by views without declared groups and keeps them stable across re-syncs', async () => {
    const { errors: firstSyncErrors } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(firstSyncErrors).toBeUndefined();

    const projectObjectId = await findObjectIdByUniversalIdentifier(
      TEST_OBJECT.universalIdentifier,
    );
    const opportunityObjectId = await findObjectIdByUniversalIdentifier(
      STANDARD_OBJECTS.opportunity.universalIdentifier,
    );

    // App object board: one group per manifest-declared select option, in
    // option order, plus the trailing empty group (the field is nullable).
    const projectKanbanAfterFirstSync = await findViewWithGroupsByName({
      objectMetadataId: projectObjectId,
      viewName: PROJECT_KANBAN_VIEW_NAME,
    });

    expect(
      sortedGroupsByPosition(projectKanbanAfterFirstSync).map(
        ({ fieldValue }) => fieldValue,
      ),
    ).toEqual([...STAGE_OPTION_VALUES, '']);
    expect(
      projectKanbanAfterFirstSync.viewGroups.every(
        ({ isVisible }) => isVisible,
      ),
    ).toBe(true);

    // Standard object board: groups derived from the workspace's existing
    // Opportunity stage field, which the manifest does not declare. The stage
    // field is non-nullable, so there is no empty group.
    const opportunityKanbanAfterFirstSync = await findViewWithGroupsByName({
      objectMetadataId: opportunityObjectId,
      viewName: OPPORTUNITY_KANBAN_VIEW_NAME,
    });

    expect(
      sortedGroupsByPosition(opportunityKanbanAfterFirstSync).map(
        ({ fieldValue }) => fieldValue,
      ),
    ).toEqual(['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER']);

    // Declared groups take precedence: nothing is derived next to them.
    const declaredGroupsViewAfterFirstSync = await findViewWithGroupsByName({
      objectMetadataId: projectObjectId,
      viewName: DECLARED_GROUPS_VIEW_NAME,
    });

    expect(declaredGroupsViewAfterFirstSync.viewGroups).toHaveLength(1);
    expect(declaredGroupsViewAfterFirstSync.viewGroups[0].fieldValue).toBe(
      'DONE',
    );

    const projectGroupIdsAfterFirstSync = sortedGroupsByPosition(
      projectKanbanAfterFirstSync,
    ).map(({ id }) => id);
    const opportunityGroupIdsAfterFirstSync = sortedGroupsByPosition(
      opportunityKanbanAfterFirstSync,
    ).map(({ id }) => id);

    // Re-syncing the identical manifest recomputes the same deterministic
    // universal identifiers: the derived groups are neither deleted (despite
    // inferDeletionFromMissingEntities) nor recreated under new rows.
    const { errors: secondSyncErrors } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    expect(secondSyncErrors).toBeUndefined();

    const projectKanbanAfterSecondSync = await findViewWithGroupsByName({
      objectMetadataId: projectObjectId,
      viewName: PROJECT_KANBAN_VIEW_NAME,
    });
    const opportunityKanbanAfterSecondSync = await findViewWithGroupsByName({
      objectMetadataId: opportunityObjectId,
      viewName: OPPORTUNITY_KANBAN_VIEW_NAME,
    });

    expect(
      sortedGroupsByPosition(projectKanbanAfterSecondSync).map(({ id }) => id),
    ).toEqual(projectGroupIdsAfterFirstSync);
    expect(
      sortedGroupsByPosition(opportunityKanbanAfterSecondSync).map(
        ({ id }) => id,
      ),
    ).toEqual(opportunityGroupIdsAfterFirstSync);
  }, 120000);
});
