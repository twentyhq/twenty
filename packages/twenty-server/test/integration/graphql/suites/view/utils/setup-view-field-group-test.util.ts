import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';

export type ViewFieldGroupTestSetup = {
  testViewId: string;
  testObjectMetadataId: string;
};

export const setupViewFieldGroupTest =
  async (): Promise<ViewFieldGroupTestSetup> => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFieldGroupTestObject',
        namePlural: 'myFieldGroupTestObjects',
        labelSingular: 'My Field Group Test Object',
        labelPlural: 'My Field Group Test Objects',
        icon: 'Icon123',
      },
    });

    const {
      data: {
        createCoreView: { id: testViewId },
      },
    } = await createOneCoreView({
      input: {
        icon: 'icon123',
        objectMetadataId,
        name: 'TestViewForFieldGroups',
      },
      expectToFail: false,
    });

    return {
      testViewId,
      testObjectMetadataId: objectMetadataId,
    };
  };

export const cleanupViewFieldGroupTest = async (
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
