import { FlatViewField } from 'src/engine/core-modules/view/flat-view/types/flat-view-field.type';
import {
  type ViewFieldTestSetup,
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-core-view-field.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { findCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields.util';
import { updateOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-core-view-field.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { FieldMetadataType } from 'twenty-shared/types';

describe('View Field Resolver - Successful object metadata identifier update side effect on view field', () => {
  let testSetup: ViewFieldTestSetup & {
    testLabelIdentifierViewFieldId: string;
  };
  beforeAll(async () => {
    const { testFieldMetadataId, testObjectMetadataId, testViewId } =
      await setupViewFieldTestV2();

    await updateOneObjectMetadata({
      input: {
        idToUpdate: testObjectMetadataId,
        updatePayload: {
          labelIdentifierFieldMetadataId: testFieldMetadataId,
        },
      },
      expectToFail: false,
    });

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
    const testLabelIdentifierViewFieldId = getCoreViewFields[0].id;
    testSetup = {
      testFieldMetadataId,
      testObjectMetadataId,
      testViewId,
      testLabelIdentifierViewFieldId,
    };
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
        id: testSetup.testLabelIdentifierViewFieldId,
        fieldMetadataId: testFieldMetadataId,
        viewId: testViewId,
      },
    ]);
  });

  it('Should not allow deleting a label identifier view field', async () => {
    const { errors } = await deleteOneCoreViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    // TODO create a util to expect a core engine v2 error
    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });

  it('Should not allow destroying a label identifier view field', async () => {
    const { errors } = await destroyOneCoreViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });

  it('Should not allow updating a label identifier view field visibility to false', async () => {
    const { errors } = await updateOneCoreViewField({
      input: {
        id: testSetup.testLabelIdentifierViewFieldId,
        update: { isVisible: false },
      },
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });

  it('Should not allow creating a view field with a position lower than the label idenfitier view field', async () => {
    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'nonLabelIdentifierField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testSetup.testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    const { errors } = await createOneCoreViewField({
      input: {
        fieldMetadataId: fieldMetadataId,
        viewId: testSetup.testViewId,
        position: -42,
      },
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });

  it.only('Should not allow updated labelIdentifier view field with a position higher than existing other view field', async () => {
    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'nonLabelIdentifierField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId: testSetup.testObjectMetadataId,
        isLabelSyncedWithName: false,
      },
      gqlFields: `
          id
          name
          label
          isLabelSyncedWithName
        `,
    });

    await createOneCoreViewField({
      input: {
        fieldMetadataId: fieldMetadataId,
        viewId: testSetup.testViewId,
        position: 42,
      },
      expectToFail: false,
    });

    const { errors } = await updateOneCoreViewField({
      input: {
        id: testSetup.testLabelIdentifierViewFieldId,
        update: {
          position: 43,
        },
      },
      expectToFail: true,
    });
    expect(errors.length).toBe(1);
    const [firstError] = errors;
    expect(firstError.extensions.code).not.toBe('INTERNAL_SERVER_ERROR');
    expect(firstError).toMatchSnapshot(
      extractRecordIdsAndDatesAsExpectAny(firstError),
    );
  });
});
