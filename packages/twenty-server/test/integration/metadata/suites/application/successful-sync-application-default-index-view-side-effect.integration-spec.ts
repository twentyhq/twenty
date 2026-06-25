import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import {
  getIndexViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { FieldMetadataType, ViewKey, ViewType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

type SyncActionFlatEntity = {
  universalIdentifier?: string;
  key?: string;
  fieldMetadataUniversalIdentifier?: string;
};

type SyncAction = {
  metadataName: string;
  type: 'create' | 'update' | 'delete';
  flatEntity?: SyncActionFlatEntity;
};

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();

const TEST_OBJECT = buildDefaultObjectManifest({
  nameSingular: 'widget',
  namePlural: 'widgets',
  labelSingular: 'Widget',
  labelPlural: 'Widgets',
  description: 'A widget',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  additionalFields: [
    {
      universalIdentifier: NAME_FIELD_ID,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
    },
  ],
});

const EXPECTED_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  getIndexViewUniversalIdentifier({
    applicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
  });

const buildManifest = (overrides?: Partial<Manifest>): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [TEST_OBJECT],
      ...overrides,
    },
  });

const findWidgetObjectId = async (): Promise<string | undefined> => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id nameSingular',
    expectToFail: false,
  });

  return objects.find((object) => object.nameSingular === 'widget')?.id;
};

const getViewAndViewFieldActions = (actions: unknown[]): SyncAction[] =>
  (actions as SyncAction[]).filter(
    (action) =>
      action.metadataName === 'view' || action.metadataName === 'viewField',
  );

describe('syncApplication default INDEX view side effect', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Widget Application',
      description: 'App for testing default INDEX view derivation',
      sourcePath: 'test-default-index-view',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('derives a default INDEX view with deterministic identifiers and makes re-sync a no-op', async () => {
    const { data: firstSyncData } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    const firstViewActions = getViewAndViewFieldActions(
      firstSyncData?.syncApplication.actions ?? [],
    );

    const indexViewCreateAction = firstViewActions.find(
      (action) =>
        action.metadataName === 'view' &&
        action.type === 'create' &&
        action.flatEntity?.universalIdentifier ===
          EXPECTED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    );

    expect(indexViewCreateAction).toBeDefined();
    expect(indexViewCreateAction?.flatEntity?.key).toBe(ViewKey.INDEX);

    const expectedNameViewFieldUniversalIdentifier =
      getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier: TEST_APP_ID,
        viewUniversalIdentifier: EXPECTED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
      });

    const nameViewFieldCreateAction = firstViewActions.find(
      (action) =>
        action.metadataName === 'viewField' &&
        action.type === 'create' &&
        action.flatEntity?.universalIdentifier ===
          expectedNameViewFieldUniversalIdentifier,
    );

    expect(nameViewFieldCreateAction).toBeDefined();

    const widgetObjectId = await findWidgetObjectId();

    expect(isDefined(widgetObjectId)).toBe(true);

    const { data: viewsData } = await findViews({
      objectMetadataId: widgetObjectId,
      expectToFail: false,
    });

    const indexView = (viewsData?.getViews ?? []).find(
      (view) => view.key === ViewKey.INDEX,
    );

    expect(indexView).toBeDefined();
    expect(indexView?.type).toBe(ViewType.TABLE);

    const { data: viewFieldsData } = await findViewFields({
      viewId: indexView?.id ?? '',
      expectToFail: false,
    });

    expect((viewFieldsData?.getViewFields ?? []).length).toBeGreaterThan(0);

    const { data: secondSyncData } = await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });

    const secondViewActions = getViewAndViewFieldActions(
      secondSyncData?.syncApplication.actions ?? [],
    );

    expect(secondViewActions).toEqual([]);
  }, 120000);

  it('does not derive a default INDEX view when the manifest declares its own', async () => {
    const explicitIndexView = {
      universalIdentifier: EXPECTED_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      name: 'Custom widgets view',
      key: ViewKey.INDEX,
      objectUniversalIdentifier: TEST_OBJECT.universalIdentifier,
      fields: [
        {
          universalIdentifier: uuidv4(),
          fieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          position: 0,
        },
      ],
    };

    await syncApplication({
      manifest: buildManifest({ views: [explicitIndexView] }),
      expectToFail: false,
    });

    const widgetObjectId = await findWidgetObjectId();

    const { data: viewsData } = await findViews({
      objectMetadataId: widgetObjectId,
      expectToFail: false,
    });

    const indexViews = (viewsData?.getViews ?? []).filter(
      (view) => view.key === ViewKey.INDEX,
    );

    expect(indexViews).toHaveLength(1);
    expect(indexViews[0]?.name).toBe('Custom widgets view');

    const { data: secondSyncData } = await syncApplication({
      manifest: buildManifest({ views: [explicitIndexView] }),
      expectToFail: false,
    });

    const secondViewActions = getViewAndViewFieldActions(
      secondSyncData?.syncApplication.actions ?? [],
    );

    expect(secondViewActions).toEqual([]);
  }, 120000);
});
