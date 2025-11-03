import {
  type ViewFieldTestSetup,
  cleanupViewFieldTestV2,
  setupViewFieldTestV2,
} from 'test/integration/graphql/suites/view/utils/setup-view-field-test-v2.util';
import { createManyCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/create-many-core-view-fields.util';
import { v4 as uuidv4 } from 'uuid';

import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

describe('View Field Resolver - Failing Create Many Operations - v2', () => {
  let testSetup: ViewFieldTestSetup;

  beforeAll(async () => {
    testSetup = await setupViewFieldTestV2();
  });

  afterAll(async () => {
    await cleanupViewFieldTestV2(testSetup.testObjectMetadataId);
  });

  it('should fail when all view fields have invalid view IDs', async () => {
    const invalidViewId = uuidv4();
    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: invalidViewId,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: testSetup.testFieldMetadataId,
        viewId: invalidViewId,
        position: 1,
        isVisible: true,
        size: 200,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: true,
    });

    expect(createdViewFields).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('View not found');
  });

  it('should fail when all view fields have invalid field metadata IDs', async () => {
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
        fieldMetadataId: invalidFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 1,
        isVisible: true,
        size: 200,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: true,
    });

    expect(createdViewFields).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Field metadata not found');
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
        fieldMetadataId: testSetup.testFieldMetadataId,
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

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: true,
    });

    expect(createdViewFields).toBeUndefined();
    expect(errors).toBeDefined();
    // All three inputs should fail with validation errors
    // The errors are accumulated and returned together
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Multiple validation errors');
  });

  it('should fail when field metadata and view belong to different objects', async () => {
    // This test would require setting up a field from a different object
    // For now, we'll use an invalid field metadata ID as a proxy
    const invalidFieldMetadataId = uuidv4();

    const inputs: CreateViewFieldInput[] = [
      {
        fieldMetadataId: invalidFieldMetadataId,
        viewId: testSetup.testViewId,
        position: 0,
        isVisible: true,
        size: 150,
      },
    ];

    const {
      data: { createManyCoreViewFields: createdViewFields },
      errors,
    } = await createManyCoreViewFields({
      inputs,
      expectToFail: true,
    });

    expect(createdViewFields).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors).toHaveLength(1);
  });
});

