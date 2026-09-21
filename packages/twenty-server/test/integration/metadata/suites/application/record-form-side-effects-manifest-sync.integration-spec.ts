import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildDefaultObjectManifest } from 'test/integration/metadata/suites/application/utils/build-default-object-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import {
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
  type ObjectManifest,
} from 'twenty-shared/application';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import {
  FieldMetadataType,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_OBJECT_ID = uuidv4();
const NAME_FIELD_ID = uuidv4();
const CODE_FIELD_ID = uuidv4();
const RATING_FIELD_ID = uuidv4();
const RATING_OPTION_ID = uuidv4();

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

const RATING_FIELD: ObjectManifest['fields'][number] = {
  universalIdentifier: RATING_FIELD_ID,
  type: FieldMetadataType.RATING,
  name: 'severity',
  label: 'Severity',
  options: [
    {
      id: RATING_OPTION_ID,
      label: '1',
      value: 'RATING_1',
      position: 0,
    },
  ],
};

const buildTicketObject = (additionalFields: ObjectManifest['fields']) =>
  buildDefaultObjectManifest({
    applicationUniversalIdentifier: TEST_APP_ID,
    universalIdentifier: TEST_OBJECT_ID,
    nameSingular: 'ticket',
    namePlural: 'tickets',
    labelSingular: 'Ticket',
    labelPlural: 'Tickets',
    description: 'A support ticket',
    icon: 'IconTicket',
    labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
    additionalFields,
  });

const buildManifest = (object: ObjectManifest) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { objects: [object] },
  });

const DERIVED_RECORD_FORM_LAYOUT_UNIVERSAL_IDENTIFIER =
  getSystemRecordFormPageLayoutUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
    objectUniversalIdentifier: TEST_OBJECT_ID,
  });

const DERIVED_RECORD_FORM_TAB_UNIVERSAL_IDENTIFIER =
  getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: TEST_APP_ID,
    pageLayoutUniversalIdentifier:
      DERIVED_RECORD_FORM_LAYOUT_UNIVERSAL_IDENTIFIER,
    title: 'Fields',
  });

const derivedFormFieldWidgetUniversalIdentifier = (
  fieldMetadataUniversalIdentifier: string,
) =>
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier: TEST_APP_ID,
    pageLayoutTabUniversalIdentifier:
      DERIVED_RECORD_FORM_TAB_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier,
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
      fieldsList {
        id
        name
        applicationId
        universalIdentifier
      }
    `,
    expectToFail: false,
  });

  return objects.find(
    (object) => object.universalIdentifier === TEST_OBJECT_ID,
  );
};

const findRecordFormTabId = async (objectMetadataId: string) => {
  const { data: pageLayoutsData } = await findPageLayouts({
    input: { objectMetadataId },
    gqlFields:
      'id type objectMetadataId universalIdentifier applicationId isSystemSideEffect',
    expectToFail: false,
  });

  const recordFormLayout = pageLayoutsData?.getPageLayouts.find(
    (pageLayout) => pageLayout.type === PageLayoutType.RECORD_FORM,
  );

  if (!isDefined(recordFormLayout)) {
    throw new Error('expected the engine record-form layout');
  }

  expect(recordFormLayout.universalIdentifier).toBe(
    DERIVED_RECORD_FORM_LAYOUT_UNIVERSAL_IDENTIFIER,
  );
  expect(recordFormLayout.isSystemSideEffect).toBe(true);

  const { data: tabsData } = await findPageLayoutTabs({
    input: { pageLayoutId: recordFormLayout.id },
    gqlFields: 'id title universalIdentifier isSystemSideEffect',
    expectToFail: false,
  });

  const tabs = tabsData?.getPageLayoutTabs ?? [];

  expect(tabs).toHaveLength(1);
  expect(tabs[0].title).toBe('Fields');
  expect(tabs[0].universalIdentifier).toBe(
    DERIVED_RECORD_FORM_TAB_UNIVERSAL_IDENTIFIER,
  );
  expect(tabs[0].isSystemSideEffect).toBe(true);

  return tabs[0].id;
};

const findRecordFormWidgets = async (pageLayoutTabId: string) => {
  const { data } = await findPageLayoutWidgets({
    input: { pageLayoutTabId },
    gqlFields:
      'id title type universalIdentifier isSystemSideEffect configuration { ... on FormFieldConfiguration { configurationType fieldMetadataId } }',
    expectToFail: false,
  });

  return (data?.getPageLayoutWidgets ?? []).map((pageLayoutWidget) => ({
    ...pageLayoutWidget,
    formFieldMetadataId:
      pageLayoutWidget.configuration?.configurationType ===
      WidgetConfigurationType.FORM_FIELD
        ? pageLayoutWidget.configuration.fieldMetadataId
        : undefined,
  }));
};

describe('Manifest sync - engine-provisioned record-form stack', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing the engine-provisioned record-form stack',
      sourcePath: 'test-record-form-side-effects',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('provisions the RECORD_FORM layout with one FORM_FIELD widget per creatable field, skipping the types the form has no input for', async () => {
    await syncApplication({
      manifest: buildManifest(
        buildTicketObject([NAME_FIELD, CODE_FIELD, RATING_FIELD]),
      ),
      expectToFail: false,
    });

    const ticket = await findTicketObject();

    if (!isDefined(ticket)) {
      throw new Error('expected the ticket object');
    }

    const recordFormTabId = await findRecordFormTabId(ticket.id);
    const widgets = await findRecordFormWidgets(recordFormTabId);

    const nameField = ticket.fieldsList?.find((field) => field.name === 'name');
    const codeField = ticket.fieldsList?.find((field) => field.name === 'code');

    if (!isDefined(nameField) || !isDefined(codeField)) {
      throw new Error('expected the name and code fields');
    }

    expect(
      widgets.every((widget) => widget.type === WidgetType.FORM_FIELD),
    ).toBe(true);
    expect(widgets.every((widget) => widget.isSystemSideEffect)).toBe(true);

    const widgetFieldMetadataIds = widgets.map(
      (widget) => widget.formFieldMetadataId,
    );

    expect(widgetFieldMetadataIds).toContain(nameField.id);
    expect(widgetFieldMetadataIds).toContain(codeField.id);

    expect(widgets).toHaveLength(2);

    const nameWidget = widgets.find(
      (widget) => widget.formFieldMetadataId === nameField.id,
    );

    expect(nameWidget?.universalIdentifier).toBe(
      derivedFormFieldWidgetUniversalIdentifier(NAME_FIELD_ID),
    );
  }, 60000);

  it('removes the widget when a field stops being UI editable and restores it when it comes back', async () => {
    await syncApplication({
      manifest: buildManifest(buildTicketObject([NAME_FIELD, CODE_FIELD])),
      expectToFail: false,
    });

    const ticket = await findTicketObject();

    if (!isDefined(ticket)) {
      throw new Error('expected the ticket object');
    }

    const recordFormTabId = await findRecordFormTabId(ticket.id);

    await syncApplication({
      manifest: buildManifest(
        buildTicketObject([NAME_FIELD, { ...CODE_FIELD, isUIEditable: false }]),
      ),
      expectToFail: false,
    });

    expect(
      (await findRecordFormWidgets(recordFormTabId)).map(
        (widget) => widget.universalIdentifier,
      ),
    ).toEqual([derivedFormFieldWidgetUniversalIdentifier(NAME_FIELD_ID)]);

    await syncApplication({
      manifest: buildManifest(buildTicketObject([NAME_FIELD, CODE_FIELD])),
      expectToFail: false,
    });

    expect(
      (await findRecordFormWidgets(recordFormTabId)).map(
        (widget) => widget.universalIdentifier,
      ),
    ).toEqual(
      expect.arrayContaining([
        derivedFormFieldWidgetUniversalIdentifier(NAME_FIELD_ID),
        derivedFormFieldWidgetUniversalIdentifier(CODE_FIELD_ID),
      ]),
    );
  }, 60000);

  it('appends a widget for a field added after the object and removes it on field deletion', async () => {
    await syncApplication({
      manifest: buildManifest(buildTicketObject([NAME_FIELD])),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest(buildTicketObject([NAME_FIELD, CODE_FIELD])),
      expectToFail: false,
    });

    const ticket = await findTicketObject();

    if (!isDefined(ticket)) {
      throw new Error('expected the ticket object');
    }

    const recordFormTabId = await findRecordFormTabId(ticket.id);
    const widgetsAfterAdd = await findRecordFormWidgets(recordFormTabId);

    expect(widgetsAfterAdd.map((widget) => widget.universalIdentifier)).toEqual(
      expect.arrayContaining([
        derivedFormFieldWidgetUniversalIdentifier(NAME_FIELD_ID),
        derivedFormFieldWidgetUniversalIdentifier(CODE_FIELD_ID),
      ]),
    );

    await syncApplication({
      manifest: buildManifest(buildTicketObject([NAME_FIELD])),
      expectToFail: false,
    });

    const widgetsAfterDelete = await findRecordFormWidgets(recordFormTabId);

    expect(
      widgetsAfterDelete.map((widget) => widget.universalIdentifier),
    ).toEqual([derivedFormFieldWidgetUniversalIdentifier(NAME_FIELD_ID)]);
  }, 60000);
});
