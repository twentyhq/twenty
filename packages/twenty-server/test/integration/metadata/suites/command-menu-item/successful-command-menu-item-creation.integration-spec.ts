import { faker } from '@faker-js/faker';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

describe('CommandMenuItem creation should succeed', () => {
  let createdCommandMenuItemId: string;
  let createdFrontComponentId: string | undefined;
  let cleanupBuiltFile: (() => void) | undefined;
  let companyObjectMetadataId: string;
  let personObjectMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: true,
      expectToFail: false,
    });

    const { cleanup } = await seedBuiltFrontComponentFile({
      builtComponentPath: 'src/front-components/index.mjs',
    });

    cleanupBuiltFile = cleanup;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const companyObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'company',
    );
    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(companyObjectMetadata);
    jestExpectToBeDefined(personObjectMetadata);

    companyObjectMetadataId = companyObjectMetadata.id;
    personObjectMetadataId = personObjectMetadata.id;
  });

  afterAll(async () => {
    cleanupBuiltFile?.();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterEach(async () => {
    if (createdCommandMenuItemId) {
      await deleteCommandMenuItem({
        expectToFail: false,
        input: { id: createdCommandMenuItemId },
      });
      createdCommandMenuItemId = undefined as unknown as string;
    }
    if (createdFrontComponentId) {
      await deleteFrontComponent({
        expectToFail: false,
        input: { id: createdFrontComponentId },
      });
      createdFrontComponentId = undefined;
    }
  });

  it('should create a basic command menu item with minimal input', async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Test Command Menu Item',
      },
    });

    createdCommandMenuItemId = data?.createCommandMenuItem?.id;

    expect(data.createCommandMenuItem).toMatchObject({
      id: expect.any(String),
      workflowVersionId,
      label: 'Test Command Menu Item',
      icon: null,
      isPinned: false,
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      availabilityObjectMetadataId: null,
    });
  });

  it('should create command menu item with all optional fields', async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Full Command Menu Item',
        icon: 'IconSparkles',
        isPinned: true,
        availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
        availabilityObjectMetadataId: companyObjectMetadataId,
      },
    });

    createdCommandMenuItemId = data?.createCommandMenuItem?.id;

    expect(data.createCommandMenuItem).toMatchObject({
      id: expect.any(String),
      workflowVersionId,
      label: 'Full Command Menu Item',
      icon: 'IconSparkles',
      isPinned: true,
      availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
      availabilityObjectMetadataId: companyObjectMetadataId,
    });
  });

  it('should create command menu item with BULK_RECORDS availability', async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Bulk Records Command',
        availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
        availabilityObjectMetadataId: personObjectMetadataId,
      },
    });

    createdCommandMenuItemId = data?.createCommandMenuItem?.id;

    expect(data.createCommandMenuItem).toMatchObject({
      id: expect.any(String),
      workflowVersionId,
      label: 'Bulk Records Command',
      availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
      availabilityObjectMetadataId: personObjectMetadataId,
    });
  });

  it('should create command menu item with GLOBAL availability (default)', async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Global Command',
      },
    });

    createdCommandMenuItemId = data?.createCommandMenuItem?.id;

    expect(data.createCommandMenuItem).toMatchObject({
      id: expect.any(String),
      workflowVersionId,
      label: 'Global Command',
      availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
    });
  });

  it('should create command menu item with frontComponentId', async () => {
    const { data: frontComponentData } = await createFrontComponent({
      expectToFail: false,
      input: {
        name: 'Test Front Component',
        componentName: 'TestFrontComponent',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    });

    createdFrontComponentId = frontComponentData?.createFrontComponent?.id;
    jestExpectToBeDefined(createdFrontComponentId);

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        frontComponentId: createdFrontComponentId,
        label: 'Front Component Command',
      },
    });

    createdCommandMenuItemId = data?.createCommandMenuItem?.id;

    expect(data.createCommandMenuItem).toMatchObject({
      id: expect.any(String),
      frontComponentId: createdFrontComponentId,
      label: 'Front Component Command',
      frontComponent: {
        id: createdFrontComponentId,
        name: 'Test Front Component',
      },
    });
  });
});
