import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { VIEW_FIELD_GQL_FIELDS } from 'test/integration/constants/view-gql-fields.constants';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { updateOneViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-view-field.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

const VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS = `
  ${VIEW_FIELD_GQL_FIELDS}
  settings {
    label
    recordLimit
  }
`;

describe('View field settings', () => {
  let testSetup: ViewFieldTestSetup;
  let createdViewFieldId: string | undefined;

  beforeAll(async () => {
    testSetup = await setupViewFieldTest();
  });

  afterAll(async () => {
    await cleanupViewFieldTest(testSetup.testObjectMetadataId);
  });

  afterEach(async () => {
    if (isDefined(createdViewFieldId)) {
      await destroyOneViewField({
        expectToFail: false,
        input: { id: createdViewFieldId },
      });
      createdViewFieldId = undefined;
    }
  });

  it('creates a view field with a column label, then updates and clears it', async () => {
    const {
      data: { createViewField },
    } = await createOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        settings: { label: '  Next step  ' },
      },
    });

    createdViewFieldId = createViewField.id;

    expect(createViewField.settings).toEqual({
      label: 'Next step',
      recordLimit: null,
    });

    const {
      data: { updateViewField: renamedViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: { settings: { label: 'Upcoming step' } },
      },
    });

    expect(renamedViewField.settings?.label).toBe('Upcoming step');

    const {
      data: { updateViewField: clearedViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
      input: {
        id: createViewField.id,
        update: { settings: null },
      },
    });

    expect(clearedViewField.settings).toBeNull();
  });

  it('rejects a record limit on a field that does not list related records', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        settings: { recordLimit: 1 },
      },
    });

    expect(response.errors).toBeDefined();
    expect(JSON.stringify(response.errors)).toContain(
      'View field record limit is only supported on one-to-many relation fields',
    );
  });

  it('rejects an empty column label', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        settings: { label: '   ' },
      },
    });

    expect(response.errors).toBeDefined();
  });

  describe('on a view field owned by the standard application', () => {
    const STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
      STANDARD_OBJECTS.company.views.allCompanies.viewFields.domainName
        .universalIdentifier;

    let standardViewFieldId: string;

    beforeAll(async () => {
      const {
        data: { getViews },
      } = await findViews<{
        viewFields: { id: string; universalIdentifier: string }[];
      }>({
        expectToFail: false,
        gqlFields: `
          viewFields {
            id
            universalIdentifier
          }
        `,
      });

      const standardViewField = getViews
        .flatMap(({ viewFields }) => viewFields)
        .find(
          ({ universalIdentifier }) =>
            universalIdentifier === STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        );

      if (!isDefined(standardViewField)) {
        throw new Error('Standard company domain view field not found');
      }

      standardViewFieldId = standardViewField.id;
    });

    afterAll(async () => {
      await updateOneViewField({
        expectToFail: false,
        input: { id: standardViewFieldId, update: { settings: null } },
      });
    });

    it('stores a valid column label as an override', async () => {
      const {
        data: { updateViewField },
      } = await updateOneViewField({
        expectToFail: false,
        gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
        input: {
          id: standardViewFieldId,
          update: { settings: { label: 'Website' } },
        },
      });

      expect(updateViewField.settings?.label).toBe('Website');
    });

    it('rejects invalid settings routed to overrides', async () => {
      const response = await updateOneViewField({
        expectToFail: true,
        gqlFields: VIEW_FIELD_WITH_SETTINGS_GQL_FIELDS,
        input: {
          id: standardViewFieldId,
          update: { settings: { recordLimit: 1 } },
        },
      });

      expect(JSON.stringify(response.errors)).toContain(
        'View field record limit is only supported on one-to-many relation fields',
      );
    });
  });
});
