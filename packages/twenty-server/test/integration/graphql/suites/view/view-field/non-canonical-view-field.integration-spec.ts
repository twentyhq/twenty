import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { isDefined } from 'twenty-shared/utils';

const VIEW_FIELD_WITH_CANONICAL_GQL_FIELDS = `
  id
  fieldMetadataId
  isCanonical
`;

describe('Non-canonical view fields', () => {
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

  it('adds several non-canonical columns next to the canonical column of a field', async () => {
    const {
      data: { createViewField: canonicalViewField },
    } = await createOneViewField({
      expectToFail: false,
      gqlFields: VIEW_FIELD_WITH_CANONICAL_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
    });

    expect(canonicalViewField.isCanonical).toBe(true);

    for (const position of [1, 2]) {
      const {
        data: { createViewField: nonCanonicalViewField },
      } = await createOneViewField({
        expectToFail: false,
        gqlFields: VIEW_FIELD_WITH_CANONICAL_GQL_FIELDS,
        input: {
          fieldMetadataId: testSetup.testFieldMetadataId,
          viewId: testSetup.testViewId,
          isCanonical: false,
          position,
        },
      });

      expect(nonCanonicalViewField).toMatchObject({
        fieldMetadataId: testSetup.testFieldMetadataId,
        isCanonical: false,
      });
    }
  });

  it('still rejects a second canonical column for the same field', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: VIEW_FIELD_WITH_CANONICAL_GQL_FIELDS,
      input: {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
      },
    });

    expect(JSON.stringify(response.errors)).toContain(
      'View field with same fieldMetadataUniversalIdentifier and viewUniversalIdentifier already exists',
    );
  });

  it('rejects a non-canonical column on the label identifier field', async () => {
    const response = await createOneViewField({
      expectToFail: true,
      gqlFields: VIEW_FIELD_WITH_CANONICAL_GQL_FIELDS,
      input: {
        fieldMetadataId: labelIdentifierFieldMetadataId,
        viewId: testSetup.testViewId,
        isCanonical: false,
        position: 10,
      },
    });

    expect(JSON.stringify(response.errors)).toContain(
      'A non-canonical view field cannot use the label identifier field',
    );
  });
});
