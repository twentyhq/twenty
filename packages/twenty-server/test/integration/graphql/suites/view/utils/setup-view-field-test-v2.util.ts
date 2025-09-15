import { createTestViewWithGraphQL } from 'test/integration/graphql/utils/view-graphql.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

export type ViewFieldTestSetup = {
  testViewId: string;
  testObjectMetadataId: string;
  testFieldMetadataId: string;
};

export const setupViewFieldTestV2 = async (): Promise<ViewFieldTestSetup> => {
  await updateFeatureFlag({
    expectToFail: false,
    featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
    value: true,
  });

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

  const view = await createTestViewWithGraphQL({
    name: 'Test View for Fields',
    objectMetadataId,
  });

  return {
    testViewId: view.id,
    testObjectMetadataId: objectMetadataId,
    testFieldMetadataId: fieldMetadataId,
  };
};

export const cleanupViewFieldTestV2 = async (
  objectMetadataId: string,
): Promise<void> => {
  try {
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
  } finally {
    await updateFeatureFlag({
      expectToFail: false,
      featureFlag: FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      value: false,
    });
  }
};
