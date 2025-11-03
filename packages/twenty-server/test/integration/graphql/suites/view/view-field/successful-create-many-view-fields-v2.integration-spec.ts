import {
  type ViewFieldTestSetup,
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { createManyCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/create-many-core-view-fields.util';
import { deleteOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/delete-one-core-view-field.util';
import { destroyOneCoreViewField } from 'test/integration/metadata/suites/view-field/utils/destroy-one-core-view-field.util';
import { isDefined } from 'twenty-shared/utils';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

describe('View Field Resolver - Successful Create Many Operations - v2', () => {
  let testSetup: ViewFieldTestSetup;
  let createdViewFieldIds: string[] = [];

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  afterEach(async () => {
    for (const viewFieldId of createdViewFieldIds) {
      if (isDefined(viewFieldId)) {
        const {
          data: { deleteCoreViewField },
        } = await deleteOneCoreViewField({
          expectToFail: false,
          input: {
            id: viewFieldId,
          },
        });

        expect(deleteCoreViewField.deletedAt).not.toBeNull();
        await destroyOneCoreViewField({
          expectToFail: false,
          input: {
            id: viewFieldId,
          },
        });
      }
    }
    createdViewFieldIds = [];
  });

  it('should successfully create multiple view fields in batch', async () => {
    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: false,
        size: 200,
      },
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 2,
        isVisible: true,
        size: 180,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(3);

    // Verify each created view field
    createdViewFields.forEach((viewField, index) => {
      expect(viewField).toMatchObject({
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        position: inputs[index].position,
        isVisible: inputs[index].isVisible,
        size: inputs[index].size,
      });

      createdViewFieldIds.push(viewField.id);
    });
  });

  it('should successfully create single view field using batch endpoint', async () => {
    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 5,
        isVisible: true,
        size: 250,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(1);

    const viewField = createdViewFields[0];

    expect(viewField).toMatchObject({
      fieldMetadataId: testSetup.testFieldMetadataId,
      viewId: testSetup.testViewId,
      position: 5,
      isVisible: true,
      size: 250,
    });

    createdViewFieldIds.push(viewField.id);
  });

  it('should return empty array when creating zero view fields', async () => {
    const inputs: CreateViewFieldInput[] = [];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(createdViewFields).toBeDefined();
    expect(createdViewFields).toHaveLength(0);
  });
});

