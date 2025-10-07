import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import {
  type ViewFieldTestSetup,
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { findCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields.util';
import { jestExpectToBeDefined } from 'test/utils/expect-to-be-defined.util.test';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

describe('View Field Resolver - Successful object metadata identifier update side effect on view field', () => {
  let testSetup: ViewFieldTestSetup & {
    testLabelIdentifierViewFieldId?: string;
  };
  beforeAll(async () => {
    const { testFieldMetadataId, testObjectMetadataId, testViewId } =
      await setupViewFieldTestV2();
    testSetup = {
      testFieldMetadataId,
      testObjectMetadataId,
      testViewId,
    };

    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: testFieldMetadataId,
        },
      },
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  it('should create a view field on label identifier object metadata update if it does not exist on view', async () => {
    const { testFieldMetadataId, testViewId } = testSetup;

    const {
      data: { getCoreViewFields },
    } = await findCoreViewFields({
      viewId: testViewId,
      expectToFail: false,
      gqlFields: `
        id
        fieldMetadataId
        viewId
      `,
    });

    expect(getCoreViewFields).toMatchObject<
      Pick<FlatViewField, 'id' | 'fieldMetadataId' | 'viewId'>[]
    >([
      {
        id: expect.any(String),
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      },
    ]);
    testSetup.testLabelIdentifierViewFieldId = getCoreViewFields[0].id;
    jestExpectToBeDefined(testSetup.testLabelIdentifierViewFieldId);
  });

  it('Should not allow deleting a label identifier view field', async () => {
    jestExpectToBeDefined(testSetup.testLabelIdentifierViewFieldId);
    const { errors } = await deleteOneCoreViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });

    it('Should not allow destroying a label identifier view field', async () => {
    jestExpectToBeDefined(testSetup.testLabelIdentifierViewFieldId);
    const { errors } = await destroyOneCoreViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });
});
