import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { isDefined } from 'twenty-shared/utils';

const CUSTOM_VIEW_FIELD_GQL_FIELDS = `
  id
  fieldMetadataId
  isCustom
`;

describe('Custom view fields', () => {
  let testSetup: ViewFieldTestSetup;
  let labelIdentifierFieldMetadataId: string;

  beforeAll(async () => {
    testSetup = await setupViewFieldTest();

    const { objects } = await findManyObjectMetadata<{
      labelIdentifierFieldMetadataId: string | null;
    }>({
      expectToFail: false,
      input: {
        filter: { id: { eq: testSetup.testObjectMetadataId } },
        paging: { first: 1 },
      },
      gqlFields: 'labelIdentifierFieldMetadataId',
    });

    const objectLabelIdentifierFieldMetadataId =
      objects[0]?.labelIdentifierFieldMetadataId;

    if (!isDefined(objectLabelIdentifierFieldMetadataId)) {
      throw new Error('Test object has no label identifier field');
    }

    labelIdentifierFieldMetadataId = objectLabelIdentifierFieldMetadataId;
  });

  afterAll(async () => {
    await cleanupViewFieldTest(testSetup.testObjectMetadataId);
  });

  it('adds several custom columns next to the data model column of a field', async () => {
    const {
      data: { createViewField: dataModelViewField },
    } = await createOneViewField({
      expectToFail: false,
      gqlFields: CUSTOM_VIEW_FIELD_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
    });

    expect(dataModelViewField.isCustom).toBe(false);

    for (const position of [1, 2]) {
      const {
        data: { createViewField: customViewField },
      } = await createOneViewField({
        expectToFail: false,
        gqlFields: CUSTOM_VIEW_FIELD_GQL_FIELDS,
        input: {
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          isCustom: true,
          position,
        },
      });

      expect(customViewField).toMatchObject({
        fieldMetadataId: testSetup.testFieldMetadataId,
        isCustom: true,
      });
    }
  });

  it('still rejects a second data model column for the same field', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: CUSTOM_VIEW_FIELD_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
    });

    expect(JSON.stringify(response.errors)).toContain(
      'View field with same fieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists',
    );
  });

  it('rejects a custom column on the label identifier field', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: CUSTOM_VIEW_FIELD_GQL_FIELDS,
      input: {
        fieldMetadataId: labelIdentifierFieldMetadataId,
        viewId: testSetup.testViewId,
        isCustom: true,
        position: 10,
      },
    });

    expect(JSON.stringify(response.errors)).toContain(
      'A custom view field cannot use the label identifier field',
    );
  });
});
