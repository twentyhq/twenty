import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { updateOneViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-view-field.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { ViewKey } from 'twenty-shared/types';

const VIEW_FIELD_WITH_LABEL_GQL_FIELDS = `
  id
  label
`;

describe('View field label', () => {
  let testSetup: ViewFieldTestSetup;
  let viewFieldId: string;

  beforeAll(async () => {
    testSetup = await setupViewFieldTest();

    const {
      data: { createViewField },
    } = await createOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        label: '  Customer   notes ',
      },
    });

    viewFieldId = createViewField.id;

    expect(createViewField.label).toBe('Customer notes');
  });

  afterAll(async () => {
    await cleanupViewFieldTest(testSetup.testObjectMetadataId);
  });

  it('renames a column', async () => {
    const {
      data: { updateViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: { id: viewFieldId, update: { label: 'Notes' } },
    });

    expect(updateViewField.label).toBe('Notes');
  });

  it('shows the default label again when the label is emptied', async () => {
    const {
      data: { updateViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: { id: viewFieldId, update: { label: '   ' } },
    });

    expect(updateViewField.label).toBeNull();
  });

  it('rejects a label longer than 63 characters', async () => {
    const { errors } = await updateOneViewField({
      expectToFail: true,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: { id: viewFieldId, update: { label: 'a'.repeat(64) } },
    });

    expect(errors).toHaveLength(1);
    expect(JSON.stringify(errors[0])).toContain(
      'A view field label cannot be longer than 63 characters',
    );
  });

  it('renames and restores a column of a standard view', async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: `
        id
        nameSingular
      `,
    });

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );

    jestExpectToBeDefined(companyObjectMetadata);

    const {
      data: { getViews },
    } = await findViews({
      objectMetadataId: companyObjectMetadata.id,
      gqlFields: `
        id
        key
      `,
      expectToFail: false,
    });

    const indexView = getViews.find((view) => view.key === ViewKey.INDEX);

    jestExpectToBeDefined(indexView);

    const {
      data: { getViewFields },
    } = await findViewFields({
      viewId: indexView.id,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      expectToFail: false,
    });

    const [standardViewField] = getViewFields;

    jestExpectToBeDefined(standardViewField);
    expect(standardViewField.label).toBeNull();

    const {
      data: { updateViewField: renamedViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: { id: standardViewField.id, update: { label: 'Account' } },
    });

    expect(renamedViewField.label).toBe('Account');

    const {
      data: { updateViewField: restoredViewField },
    } = await updateOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_LABEL_GQL_FIELDS,
      input: { id: standardViewField.id, update: { label: null } },
    });

    expect(restoredViewField.label).toBeNull();
  });
});
