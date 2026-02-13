import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { FieldMetadataType } from 'twenty-shared/types';

export type ViewFieldTestSetup = {
  testViewId: string;
  testObjectMetadataId: string;
  testFieldMetadataId: string;
};

export const setupViewFieldTest = async (): Promise<ViewFieldTestSetup> => {
  const {
    data: {
      createOneObject: { id: objectMetadataId },
    },
  } = await createOneObjectMetadata({
    expectToFail: false,
    input: {
      nameSingular: 'myFieldTestObject',
      namePlural: 'myFieldTestObjects',
      labelSingular: 'My Field Test Object',
      labelPlural: 'My Field Test Objects',
      icon: 'Icon123',
    },
  });

  const {
    data: {
      createOneField: { id: fieldMetadataId },
    },
  } = await createOneFieldMetadata({
    expectToFail: false,
    input: {
      name: 'testField',
      label: 'Test Field',
      type: FieldMetadataType.TEXT,
      objectMetadataId,
      isLabelSyncedWithName: true,
    },
    gqlFields: `
      id
      name
      label
      isLabelSyncedWithName
    `,
  });

  const {
    data: {
      createCoreView: { id: testViewId },
    },
  } = await createOneCoreView({
    input: {
      icon: 'icon123',
      objectMetadataId,
      name: 'TestViewForFields',
    },
    expectToFail: false,
  });

  return {
    testViewId,
    testObjectMetadataId: objectMetadataId,
    testFieldMetadataId: fieldMetadataId,
  };
};

export const cleanupViewFieldTest = async (
  objectMetadataId: string,
): Promise<void> => {
  await updateOneObjectMetadata({
    input: {
      idToUpdate: objectMetadataId,
      updatePayload: {
        isActive: false,
      },
    },
  });
  await deleteOneObjectMetadata({
    expectToFail: false,
    input: { idToDelete: objectMetadataId },
  });
};
