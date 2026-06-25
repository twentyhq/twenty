import {
  type ViewFieldTestSetup,
  cleanupViewFieldTest,
  setupViewFieldTest,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneViewField } from 'test/integration/metadata/suites/view-field/utils/create-one-view-field.util';
import { deleteOneViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-view-field.util';
import { destroyOneViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-view-field.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { updateOneViewField } from 'test/integration/metadata/suites/view-field/utils/update-one-view-field.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

describe('View Field Resolver - Successful object metadata identifier update side effect on view field', () => {
  let testSetup: ViewFieldTestSetup & {
    testLabelIdentifierViewFieldId: string;
  };

  beforeAll(async () => {
    const { testFieldMetadataId, testObjectMetadataId, testViewId } =
      await setupViewFieldTest();

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
      data: { getViewFields },
    } = await findViewFields({
      viewId: testViewId,
      expectToFail: false,
      gqlFields: `
        id
        fieldMetadataId
        viewId
      `,
    });
    const testLabelIdentifierViewFieldId = getViewFields[0].id;

    testSetup = {
      testFieldMetadataId,
      testObjectMetadataId,
      testViewId,
      testLabelIdentifierViewFieldId,
    };
  });

  afterAll(async () => {
    await cleanupViewFieldTest(testSetup.testObjectMetadataId);
  });

  it('should create a view field on label identifier object metadata update if it does not exist on view', async () => {
    const { testFieldMetadataId, testViewId } = testSetup;
    const {
      data: { getViewFields },
    } = await findViewFields({
      viewId: testViewId,
      expectToFail: false,
      gqlFields: `
        id
        fieldMetadataId
        viewId
      `,
    });

    expect(getViewFields).toMatchObject<
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
    const { errors } = await deleteOneViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('Should not allow destroying a label identifier view field', async () => {
    const { errors } = await destroyOneViewField({
      input: { id: testSetup.testLabelIdentifierViewFieldId },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('Should not allow updating a label identifier view field visibility to false', async () => {
    const { errors } = await updateOneViewField({
      input: {
        id: testSetup.testLabelIdentifierViewFieldId,
        update: { isVisible: false },
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('Should not allow creating a view field with a position lower than the label identifier view field', async () => {
    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'nonLabelIdentifierFieldFailing',
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

    const { errors } = await createOneViewField({
      input: {
        fieldMetadataId: fieldMetadataId,
        viewId: testSetup.testViewId,
        position: -42,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('Should not allow updating labelIdentifier view field with a position higher than existing other view field', async () => {
    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'nonLabelIdentifierFieldSuccessful',
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

    await createOneViewField({
      input: {
        fieldMetadataId: fieldMetadataId,
        viewId: testSetup.testViewId,
        position: 42,
      },
      expectToFail: false,
    });

    const { errors } = await updateOneViewField({
      input: {
        id: testSetup.testLabelIdentifierViewFieldId,
        update: {
          position: 43,
        },
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });

  it('Should update labelIdentifier view field with a position higher than existing other view field', async () => {
    const {
      data: {
        createOneField: { id: fieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'justafield',
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

    await createOneViewField({
      input: {
        fieldMetadataId: fieldMetadataId,
        viewId: testSetup.testViewId,
        position: 42,
      },
      expectToFail: false,
    });

    await updateOneViewField({
      input: {
        id: testSetup.testLabelIdentifierViewFieldId,
        update: {
          position: 41,
        },
      },
      expectToFail: false,
    });
  });
});
