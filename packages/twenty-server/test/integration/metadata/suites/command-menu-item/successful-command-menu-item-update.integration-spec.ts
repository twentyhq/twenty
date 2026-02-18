import { faker } from '@faker-js/faker';
import { createCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/create-command-menu-item.util';
import { deleteCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/delete-command-menu-item.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateCommandMenuItem } from 'test/integration/metadata/suites/command-menu-item/utils/update-command-menu-item.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';

describe('CommandMenuItem update should succeed', () => {
  let createdCommandMenuItemId: string;
  let companyObjectMetadataId: string;
  let personObjectMetadataId: string;

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: true,
      expectToFail: false,
    });

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
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  beforeEach(async () => {
    const workflowVersionId = faker.string.uuid();

    const { data } = await createCommandMenuItem({
      expectToFail: false,
      input: {
        workflowVersionId,
        label: 'Original Label',
        icon: 'IconOriginal',
        isPinned: false,
        availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
      },
    });

    createdCommandMenuItemId = data.createCommandMenuItem.id;
  });

  afterEach(async () => {
    if (createdCommandMenuItemId) {
      await deleteCommandMenuItem({
        expectToFail: false,
        input: { id: createdCommandMenuItemId },
      });
      createdCommandMenuItemId = undefined as unknown as string;
    }
  });

  it('should update the label', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        label: 'Updated Label',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      label: 'Updated Label',
    });
  });

  it('should update the icon', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        icon: 'IconUpdated',
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      icon: 'IconUpdated',
    });
  });

  it('should update isPinned', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        isPinned: true,
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      isPinned: true,
    });
  });

  it('should update availabilityType and availabilityObjectMetadataId', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
        availabilityObjectMetadataId: companyObjectMetadataId,
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      availabilityType: CommandMenuItemAvailabilityType.SINGLE_RECORD,
      availabilityObjectMetadataId: companyObjectMetadataId,
    });
  });

  it('should update multiple fields at once', async () => {
    const { data } = await updateCommandMenuItem({
      expectToFail: false,
      input: {
        id: createdCommandMenuItemId,
        label: 'Fully Updated Label',
        icon: 'IconNew',
        isPinned: true,
        availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
        availabilityObjectMetadataId: personObjectMetadataId,
      },
    });

    expect(data.updateCommandMenuItem).toMatchObject({
      id: createdCommandMenuItemId,
      label: 'Fully Updated Label',
      icon: 'IconNew',
      isPinned: true,
      availabilityType: CommandMenuItemAvailabilityType.BULK_RECORDS,
      availabilityObjectMetadataId: personObjectMetadataId,
    });
  });
});
