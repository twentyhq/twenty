import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  ViewFilterGroupLogicalOperator,
  ViewFilterOperand,
  ViewSortDirection,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FIELD_ID = uuidv4();

const SOURCE_VIEW_ID = uuidv4();
const TARGET_VIEW_ID = uuidv4();

const VIEW_FIELD_ID = uuidv4();
const VIEW_FIELD_GROUP_ID = uuidv4();
const VIEW_GROUP_ID = uuidv4();
const VIEW_FILTER_ID = uuidv4();
const VIEW_SORT_ID = uuidv4();
const VIEW_FILTER_GROUP_ID = uuidv4();

const SOURCE_VIEW_NAME = 'Reparent Source View';
const TARGET_VIEW_NAME = 'Reparent Target View';

const CUSTOM_FIELD_NAME = 'integrationReparentColumn';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.universalIdentifier;

const personFieldManifest: FieldManifest = {
  universalIdentifier: TEST_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: CUSTOM_FIELD_NAME,
  label: 'Integration Reparent Column',
  description: 'Custom field used to reparent view children between views',
  icon: 'IconStar',
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
};

// Each of the six view-xxx child entities is reparentable: moving a child
// (same universalIdentifier) from one view to another must only update its
// viewId (the row is preserved, not recreated).
const buildViewChildren = () => ({
  fields: [
    {
      universalIdentifier: VIEW_FIELD_ID,
      fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
      position: 1,
      isVisible: true,
      size: 150,
    },
  ],
  fieldGroups: [
    {
      universalIdentifier: VIEW_FIELD_GROUP_ID,
      name: 'Reparent Field Group',
      position: 0,
      isVisible: true,
    },
  ],
  groups: [
    {
      universalIdentifier: VIEW_GROUP_ID,
      fieldValue: 'reparent-group-value',
      position: 0,
      isVisible: true,
    },
  ],
  filters: [
    {
      universalIdentifier: VIEW_FILTER_ID,
      fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
      operand: ViewFilterOperand.CONTAINS,
      value: 'reparent',
    },
  ],
  sorts: [
    {
      universalIdentifier: VIEW_SORT_ID,
      fieldMetadataUniversalIdentifier: TEST_FIELD_ID,
      direction: ViewSortDirection.ASC,
    },
  ],
  filterGroups: [
    {
      universalIdentifier: VIEW_FILTER_GROUP_ID,
      logicalOperator: ViewFilterGroupLogicalOperator.AND,
    },
  ],
});

const SOURCE_VIEW = {
  universalIdentifier: SOURCE_VIEW_ID,
  name: SOURCE_VIEW_NAME,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLayoutList',
};

const TARGET_VIEW = {
  universalIdentifier: TARGET_VIEW_ID,
  name: TARGET_VIEW_NAME,
  objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  type: ViewType.TABLE,
  icon: 'IconLayoutList',
};

const buildManifestWithViews = (views: Manifest['views']): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      fields: [personFieldManifest],
      views,
    },
  });

// Both views exist; the children live under the chosen view.
const buildManifestWithChildrenOnView = (
  childrenViewUniversalIdentifier: string,
): Manifest => {
  const children = buildViewChildren();

  return buildManifestWithViews([
    childrenViewUniversalIdentifier === SOURCE_VIEW_ID
      ? { ...SOURCE_VIEW, ...children }
      : SOURCE_VIEW,
    childrenViewUniversalIdentifier === TARGET_VIEW_ID
      ? { ...TARGET_VIEW, ...children }
      : TARGET_VIEW,
  ]);
};

// The source view is removed from the manifest (deleted) while its children are
// reparented onto the target view in the very same sync.
const buildManifestWithSourceViewDeletedAndChildrenOnTarget = (): Manifest =>
  buildManifestWithViews([{ ...TARGET_VIEW, ...buildViewChildren() }]);

const VIEW_WITH_CHILDREN_GQL_FIELDS = `
  id
  name
  viewFields { id viewId }
  viewFieldGroups { id viewId }
  viewGroups { id viewId }
  viewFilters { id viewId }
  viewSorts { id viewId }
  viewFilterGroups { id viewId }
`;

type ViewWithChildren = {
  id: string;
  name: string;
  viewFields: { id: string; viewId: string }[];
  viewFieldGroups: { id: string; viewId: string }[];
  viewGroups: { id: string; viewId: string }[];
  viewFilters: { id: string; viewId: string }[];
  viewSorts: { id: string; viewId: string }[];
  viewFilterGroups: { id: string; viewId: string }[];
};

const CHILD_COLLECTION_KEYS = [
  'viewFields',
  'viewFieldGroups',
  'viewGroups',
  'viewFilters',
  'viewSorts',
  'viewFilterGroups',
] as const satisfies readonly (keyof ViewWithChildren)[];

const findPersonObjectId = async () => {
  const objects = await findManyObjectMetadataWithIndexes({
    expectToFail: false,
  });

  const person = objects.find(
    (object) =>
      object.universalIdentifier === PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  );

  if (!person) {
    throw new Error('Standard Person object not found in workspace');
  }

  return person.id;
};

const findPersonViewsWithChildren = async (
  personObjectId: string,
): Promise<ViewWithChildren[]> => {
  const { data } = await findViews({
    objectMetadataId: personObjectId,
    gqlFields: VIEW_WITH_CHILDREN_GQL_FIELDS,
    expectToFail: false,
  });

  return (data?.getViews ?? []) as unknown as ViewWithChildren[];
};

const findReparentViews = async (personObjectId: string) => {
  const views = await findPersonViewsWithChildren(personObjectId);

  const sourceView = views.find((view) => view.name === SOURCE_VIEW_NAME);
  const targetView = views.find((view) => view.name === TARGET_VIEW_NAME);

  if (!sourceView || !targetView) {
    throw new Error('Reparent source and/or target views not found');
  }

  return { sourceView, targetView };
};

const getChildIdsByCollection = (view: ViewWithChildren) =>
  Object.fromEntries(
    CHILD_COLLECTION_KEYS.map((childCollectionKey) => [
      childCollectionKey,
      view[childCollectionKey][0].id,
    ]),
  ) as Record<(typeof CHILD_COLLECTION_KEYS)[number], string>;

describe('Manifest reparent - all view children are reparentable', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing view children reparenting across views',
      sourcePath: 'test-manifest-reparent-view-children',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('moves every view child from the source view to the target view by only updating viewId', async () => {
    const personObjectId = await findPersonObjectId();

    const { errors: firstSyncErrors } = await syncApplication({
      manifest: buildManifestWithChildrenOnView(SOURCE_VIEW_ID),
      expectToFail: false,
    });

    expect(firstSyncErrors).toBeUndefined();

    const {
      sourceView: sourceAfterFirstSync,
      targetView: targetAfterFirstSync,
    } = await findReparentViews(personObjectId);

    // Every child collection starts on the source view with exactly one row,
    // and the target view has none.
    for (const childCollectionKey of CHILD_COLLECTION_KEYS) {
      expect(sourceAfterFirstSync[childCollectionKey]).toHaveLength(1);
      expect(sourceAfterFirstSync[childCollectionKey][0].viewId).toBe(
        sourceAfterFirstSync.id,
      );
      expect(targetAfterFirstSync[childCollectionKey]).toHaveLength(0);
    }

    const childIdsByCollectionBeforeReparent =
      getChildIdsByCollection(sourceAfterFirstSync);

    const { errors: secondSyncErrors } = await syncApplication({
      manifest: buildManifestWithChildrenOnView(TARGET_VIEW_ID),
      expectToFail: false,
    });

    expect(secondSyncErrors).toBeUndefined();

    const { sourceView: sourceAfterReparent, targetView: targetAfterReparent } =
      await findReparentViews(personObjectId);

    for (const childCollectionKey of CHILD_COLLECTION_KEYS) {
      // The source view no longer owns any child.
      expect(sourceAfterReparent[childCollectionKey]).toHaveLength(0);

      // The target view now owns exactly the same row (same id), proving the
      // reparent updated viewId instead of deleting and recreating the child.
      expect(targetAfterReparent[childCollectionKey]).toHaveLength(1);
      expect(targetAfterReparent[childCollectionKey][0].id).toBe(
        childIdsByCollectionBeforeReparent[childCollectionKey],
      );
      expect(targetAfterReparent[childCollectionKey][0].viewId).toBe(
        targetAfterReparent.id,
      );
    }
  }, 60000);

  it('reparents every view child onto the target view when the source view is deleted in the same sync', async () => {
    const personObjectId = await findPersonObjectId();

    const { errors: firstSyncErrors } = await syncApplication({
      manifest: buildManifestWithChildrenOnView(SOURCE_VIEW_ID),
      expectToFail: false,
    });

    expect(firstSyncErrors).toBeUndefined();

    const { sourceView: sourceAfterFirstSync } =
      await findReparentViews(personObjectId);

    const childIdsByCollectionBeforeReparent =
      getChildIdsByCollection(sourceAfterFirstSync);

    // Second sync deletes the source view and reparents its children onto the
    // target view at once. Because viewId is onDelete: CASCADE, this only
    // succeeds if the reparent updates run before the source view deletion.
    const { errors: secondSyncErrors } = await syncApplication({
      manifest: buildManifestWithSourceViewDeletedAndChildrenOnTarget(),
      expectToFail: false,
    });

    expect(secondSyncErrors).toBeUndefined();

    const viewsAfterReparent =
      await findPersonViewsWithChildren(personObjectId);

    const sourceAfterReparent = viewsAfterReparent.find(
      (view) => view.name === SOURCE_VIEW_NAME,
    );
    const targetAfterReparent = viewsAfterReparent.find(
      (view) => view.name === TARGET_VIEW_NAME,
    );

    // The source view has been deleted.
    expect(sourceAfterReparent).toBeUndefined();

    if (!targetAfterReparent) {
      throw new Error('Reparent target view not found after sync');
    }

    for (const childCollectionKey of CHILD_COLLECTION_KEYS) {
      // Each child survived the source view deletion and now lives on the
      // target view as the very same row (same id) instead of being
      // cascade-deleted along with the source view.
      expect(targetAfterReparent[childCollectionKey]).toHaveLength(1);
      expect(targetAfterReparent[childCollectionKey][0].id).toBe(
        childIdsByCollectionBeforeReparent[childCollectionKey],
      );
      expect(targetAfterReparent[childCollectionKey][0].viewId).toBe(
        targetAfterReparent.id,
      );
    }
  }, 60000);
});
