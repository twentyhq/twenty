import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type Manifest, type ViewManifest } from 'twenty-shared/application';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const OBJECT_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();
const MARKET_FIELD_ID = uuidv4();
const VIEW_ID = uuidv4();
const DECLARED_VIEW_GROUP_ID = uuidv4();

const VIEW_NAME = 'Partners by market';

const MARKET_OPTIONS: FieldMetadataComplexOption[] = [
  {
    id: uuidv4(),
    value: 'AUSTRALIA',
    label: 'Australia',
    color: 'green',
    position: 0,
  },
  {
    id: uuidv4(),
    value: 'NEW_ZEALAND',
    label: 'New Zealand',
    color: 'blue',
    position: 1,
  },
  {
    id: uuidv4(),
    value: 'SINGAPORE',
    label: 'Singapore',
    color: 'pink',
    position: 2,
  },
];

const buildObjectManifest = () =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: OBJECT_ID,
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    nameSingular: 'partnerOrganisation',
    namePlural: 'partnerOrganisations',
    labelSingular: 'Partner Organisation',
    labelPlural: 'Partner Organisations',
    icon: 'IconBuilding',
    additionalFields: [
      {
        universalIdentifier: NAME_FIELD_ID,
        type: FieldMetadataType.TEXT,
        name: 'name',
        label: 'Name',
      },
      {
        universalIdentifier: MARKET_FIELD_ID,
        type: FieldMetadataType.SELECT,
        name: 'market',
        label: 'Market',
        options: MARKET_OPTIONS,
      },
    ],
  });

const buildManifestWithGroupedView = (
  viewGroups?: ViewManifest['groups'],
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      objects: [buildObjectManifest()],
      views: [
        {
          universalIdentifier: VIEW_ID,
          name: VIEW_NAME,
          objectUniversalIdentifier: OBJECT_ID,
          type: ViewType.TABLE,
          icon: 'IconWorld',
          mainGroupByFieldMetadataUniversalIdentifier: MARKET_FIELD_ID,
          groups: viewGroups,
        },
      ],
    },
  });

const findGroupedView = async () => {
  const { objects } = await findManyObjectMetadata({
    input: { filter: {}, paging: { first: 100 } },
    gqlFields: 'id universalIdentifier',
    expectToFail: false,
  });

  const partnerOrganisation = objects.find(
    (object) => object.universalIdentifier === OBJECT_ID,
  );

  if (!partnerOrganisation) {
    throw new Error('Partner organisation object not found after sync');
  }

  const { data } = await findViews({
    objectMetadataId: partnerOrganisation.id,
    gqlFields: 'id name viewGroups { id fieldValue position isVisible }',
    expectToFail: false,
  });

  const view = (data?.getViews ?? []).find((view) => view.name === VIEW_NAME);

  if (!view) {
    throw new Error('Grouped view not found after sync');
  }

  return view;
};

describe('Manifest sync - grouped views', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing grouped views',
      sourcePath: 'test-manifest-sync-grouped-view',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('creates one view group per option of the group by field when the manifest declares none', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithGroupedView(),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const view = await findGroupedView();

    expect(
      view.viewGroups
        .map(({ fieldValue, position, isVisible }) => ({
          fieldValue,
          position,
          isVisible,
        }))
        .sort((a, b) => a.position - b.position),
    ).toEqual([
      { fieldValue: 'AUSTRALIA', position: 0, isVisible: true },
      { fieldValue: 'NEW_ZEALAND', position: 1, isVisible: true },
      { fieldValue: 'SINGAPORE', position: 2, isVisible: true },
      { fieldValue: '', position: 3, isVisible: true },
    ]);
  }, 60000);

  it('keeps the view groups stable across syncs', async () => {
    await syncApplication({
      manifest: buildManifestWithGroupedView(),
      expectToFail: false,
    });

    const viewAfterFirstSync = await findGroupedView();

    await syncApplication({
      manifest: buildManifestWithGroupedView(),
      expectToFail: false,
    });

    const viewAfterSecondSync = await findGroupedView();

    expect(viewAfterSecondSync.viewGroups.map(({ id }) => id).sort()).toEqual(
      viewAfterFirstSync.viewGroups.map(({ id }) => id).sort(),
    );
  }, 60000);

  it('completes the view groups the manifest declares without touching them', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifestWithGroupedView([
        {
          universalIdentifier: DECLARED_VIEW_GROUP_ID,
          fieldValue: 'SINGAPORE',
          position: 0,
          isVisible: false,
        },
      ]),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const view = await findGroupedView();

    expect(
      view.viewGroups.find(({ fieldValue }) => fieldValue === 'SINGAPORE'),
    ).toMatchObject({ position: 0, isVisible: false });

    expect(view.viewGroups.map(({ fieldValue }) => fieldValue).sort()).toEqual([
      '',
      'AUSTRALIA',
      'NEW_ZEALAND',
      'SINGAPORE',
    ]);
  }, 60000);
});
