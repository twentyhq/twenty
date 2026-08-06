import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { type ObjectManifest } from 'twenty-shared/application';
import { FieldMetadataType, ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();
const CODE_FIELD_ID = uuidv4();

const NAME_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: NAME_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
};

const CODE_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: CODE_FIELD_ID,
  type: FieldMetadataType.TEXT,
  name: 'code',
  label: 'Code',
};

const buildTicketObject = ({
  labelIdentifierFieldMetadataUniversalIdentifier,
  additionalFields,
}: {
  labelIdentifierFieldMetadataUniversalIdentifier: string;
  additionalFields: ObjectManifest['fields'];
}) =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'ticket',
    namePlural: 'tickets',
    labelSingular: 'Ticket',
    labelPlural: 'Tickets',
    description: 'A support ticket',
    icon: 'IconTicket',
    labelIdentifierFieldMetadataUniversalIdentifier,
    additionalFields,
  });

const buildManifest = (object: ObjectManifest) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [object] },
  });

const findTicketObject = async () => {
  const { objects } = await findManyObjectMetadata({
    input: {
      filter: {},
      paging: { first: 100 },
    },
    gqlFields: `
      id
      universalIdentifier
      labelIdentifierFieldMetadataId
      fieldsList {
        id
        name
        universalIdentifier
      }
    `,
    expectToFail: false,
  });

  return objects.find(
    (object) => object.universalIdentifier === TEST_OBJECT_ID,
  );
};

const findTicketRecordPageView = async (objectMetadataId: string) => {
  const { data } = await findViews({
    objectMetadataId,
    gqlFields: 'id key type',
    expectToFail: false,
  });

  return data?.getViews.find((view) => view.key === ViewKey.FIELDS_WIDGET);
};

const findRecordPageViewFields = async (viewId: string) => {
  const { data } = await findViewFields({
    viewId,
    gqlFields: VIEW_FIELD_GQL_FIELDS,
    expectToFail: false,
  });

  return data?.getViewFields ?? [];
};

// Coverage of the record-page side-effect handlers through the manifest path:
// objectRecordPageOnCreate on object creation and
// objectRecordPageLabelIdentifierOnUpdate on relabel.
describe('Manifest sync - engine-provisioned record-page stack', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing the engine-provisioned record-page stack',
      sourcePath: 'test-record-page-side-effects',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('provisions the FIELDS_WIDGET view (label identifier excluded) and the RECORD_PAGE layout with its 5 tabs on object creation', async () => {
    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    const ticket = await findTicketObject();

    if (!isDefined(ticket)) {
      throw new Error('expected the ticket object');
    }

    const recordPageView = await findTicketRecordPageView(ticket.id);

    expect(recordPageView).toBeDefined();

    if (!isDefined(recordPageView)) {
      throw new Error('expected the engine record-page view');
    }

    const nameField = ticket.fieldsList?.find((field) => field.name === 'name');
    const codeField = ticket.fieldsList?.find((field) => field.name === 'code');

    if (!isDefined(nameField) || !isDefined(codeField)) {
      throw new Error('expected the name and code fields');
    }

    const recordPageViewFields = await findRecordPageViewFields(
      recordPageView.id,
    );

    // The label identifier is displayed in the record title, never in the
    // fields widget.
    expect(
      recordPageViewFields.some(
        (viewField) => viewField.fieldMetadataId === nameField.id,
      ),
    ).toBe(false);
    expect(
      recordPageViewFields.some(
        (viewField) => viewField.fieldMetadataId === codeField.id,
      ),
    ).toBe(true);

    const { data: pageLayoutsData } = await findPageLayouts({
      input: { objectMetadataId: ticket.id },
      gqlFields: 'id type objectMetadataId isSystemSideEffect',
      expectToFail: false,
    });

    const recordPageLayout = pageLayoutsData?.getPageLayouts.find(
      (pageLayout) => pageLayout.type === PageLayoutType.RECORD_PAGE,
    );

    expect(recordPageLayout).toBeDefined();
    expect(recordPageLayout?.isSystemSideEffect).toBe(true);

    if (!isDefined(recordPageLayout)) {
      throw new Error('expected the engine record-page layout');
    }

    const { data: tabsData } = await findPageLayoutTabs({
      input: { pageLayoutId: recordPageLayout.id },
      gqlFields: 'id title',
      expectToFail: false,
    });

    const tabTitles = (tabsData?.getPageLayoutTabs ?? []).map(
      (tab) => tab.title,
    );

    expect(tabTitles).toHaveLength(5);
    expect(tabTitles).toEqual(
      expect.arrayContaining(['Home', 'Timeline', 'Tasks', 'Notes', 'Files']),
    );
  }, 60000);

  it('swaps the record-page view fields when the label identifier changes', async () => {
    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(
        buildTicketObject({
          labelIdentifierFieldMetadataUniversalIdentifier: CODE_FIELD_ID,
          additionalFields: [NAME_FIELD, CODE_FIELD],
        }),
      ),
      expectToFail: false,
    });

    const ticket = await findTicketObject();

    if (!isDefined(ticket)) {
      throw new Error('expected the ticket object');
    }

    const recordPageView = await findTicketRecordPageView(ticket.id);

    if (!isDefined(recordPageView)) {
      throw new Error('expected the engine record-page view');
    }

    const nameField = ticket.fieldsList?.find((field) => field.name === 'name');
    const codeField = ticket.fieldsList?.find((field) => field.name === 'code');

    if (!isDefined(nameField) || !isDefined(codeField)) {
      throw new Error('expected the name and code fields');
    }

    const recordPageViewFields = await findRecordPageViewFields(
      recordPageView.id,
    );

    // The new label identifier leaves the fields widget (displayed in the
    // title), the previous one is restored into it.
    expect(
      recordPageViewFields.some(
        (viewField) => viewField.fieldMetadataId === codeField.id,
      ),
    ).toBe(false);

    const restoredNameViewField = recordPageViewFields.find(
      (viewField) => viewField.fieldMetadataId === nameField.id,
    );

    expect(restoredNameViewField).toBeDefined();
    expect(restoredNameViewField?.isVisible).toBe(true);
  }, 60000);
});
