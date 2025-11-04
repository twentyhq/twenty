import { createManyCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/create-many-core-view-fields.util';
import { v4 as uuidv4 } from 'uuid';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

describe('View Field Resolver - Failing Create Many Operations - v2', () => {
  let testSetup: {
    testViewId: string;
    testObjectMetadataId: string;
    firstTestFieldMetadataId: string;
    secondTestFieldMetadataId: string;
  };

  beforeAll(async () => {
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'myFieldTestObjectV2',
        namePlural: 'myFieldTestObjectsV2',
        labelSingular: 'My Field Test Object v2',
        labelPlural: 'My Field Test Objects v2',
        icon: 'Icon123',
      },
    });

    const {
      data: {
        createOneField: { id: firstTestFieldMetadataId },
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
        createOneField: { id: secondTestFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'secondTestField',
        label: 'Test Field',
        type: FieldMetadataType.TEXT,
        objectMetadataId,
        isLabelSyncedWithName: false,
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

    testSetup = {
      testViewId,
      testObjectMetadataId: objectMetadataId,
      firstTestFieldMetadataId,
      secondTestFieldMetadataId,
    };
  });

  afterAll(async () => {
    await updateOneObjectMetadata({
      input: {
        idToUpdate: testSetup.testObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.testObjectMetadataId },
    });
  });

  it('should accumulate multiple validation errors when some inputs are invalid', async () => {
    const invalidViewId = uuidv4();
    const invalidFieldMetadataId = uuidv4();

    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: invalidFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: testSetup.firstTestFieldMetadataId,
        viewId: invalidViewId,
        position: 1,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId: invalidFieldMetadataId,
        viewId: invalidViewId,
        position: 2,
        isVisible: true,
        size: 180,
      },
    ];

    const { errors } = await createManyCoreViewFields({
      inputs,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
