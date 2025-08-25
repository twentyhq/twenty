import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { CREATE_ENUM_FIELD_METADATA_TEST_CASES } from 'test/integration/metadata/suites/field-metadata/enum/create-enum-field-metadata-test-cases';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import {
  LISTING_NAME_PLURAL,
  LISTING_NAME_SINGULAR,
} from 'test/integration/metadata/suites/object-metadata/constants/test-object-names.constant';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { eachTestingContextFilter } from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { fieldMetadataEnumTypes } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

describe.each(fieldMetadataEnumTypes)(
  'Create field metadata %s tests suite v2',
  (testedFieldMetadataType) => {
    let createdObjectMetadataId: string;
    let createdFieldMetadataId: string | undefined = undefined;
    const testCases =
      CREATE_ENUM_FIELD_METADATA_TEST_CASES[testedFieldMetadataType];

    if (!isDefined(testCases)) {
      return;
    }
    const { successful: successfulTestCases } = testCases;

    beforeAll(async () => {
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        true,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);

      const { data } = await createOneObjectMetadata({
        expectToFail: false,
        input: {
          labelSingular: LISTING_NAME_SINGULAR,
          labelPlural: LISTING_NAME_PLURAL,
          nameSingular: LISTING_NAME_SINGULAR,
          namePlural: LISTING_NAME_PLURAL,
          icon: 'IconBuildingSkyscraper',
          isLabelSyncedWithName: false,
        },
      });

      createdObjectMetadataId = data.createOneObject.id;
    });

    afterAll(async () => {
      await updateOneObjectMetadata({
        expectToFail: false,
        input: {
          idToUpdate: createdObjectMetadataId,
          updatePayload: { isActive: false },
        },
      });
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: createdObjectMetadataId },
      });
      const enablePermissionsQuery = updateFeatureFlagFactory(
        SEED_APPLE_WORKSPACE_ID,
        FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
        false,
      );

      await makeGraphqlAPIRequest(enablePermissionsQuery);
    });

    beforeEach(() => {
      createdFieldMetadataId = undefined;
    });
    afterEach(async () => {
      if (!isDefined(createdFieldMetadataId)) {
        return;
      }
      await updateOneFieldMetadata({
        input: {
          updatePayload: {
            isActive: false,
          },
          idToUpdate: createdFieldMetadataId,
        },
        expectToFail: false,
      });
      await deleteOneFieldMetadata({
        input: {
          idToDelete: createdFieldMetadataId,
        },
        expectToFail: false,
      });
    });

    test.each(eachTestingContextFilter(successfulTestCases))(
      'Create $title',
      async ({ context: { input, expectedOptions } }) => {
        const { data, errors } = await createOneFieldMetadata<
          typeof testedFieldMetadataType
        >({
          expectToFail: false,
          input: {
            objectMetadataId: createdObjectMetadataId,
            type: testedFieldMetadataType,
            name: 'testField',
            label: 'Test Field',
            isLabelSyncedWithName: false,
            ...input,
          },
          gqlFields: `
        id
        options
        defaultValue
        type
        `,
        });

        expect(data).not.toBeNull();
        expect(data.createOneField).toBeDefined();
        expect(data.createOneField.type).toEqual(testedFieldMetadataType);
        createdFieldMetadataId = data.createOneField.id;
        const createdOptions = data.createOneField.options;
        const optionsToCompare = expectedOptions ?? input.options ?? [];

        expect(errors).toBeUndefined();
        expect(createdOptions?.length).toBe(optionsToCompare.length);
        createdOptions?.forEach((option) => expect(option.id).toBeDefined());
        expect(createdOptions).toMatchObject(optionsToCompare);

        if (isDefined(input.defaultValue)) {
          expect(data.createOneField.defaultValue).toEqual(input.defaultValue);
        }
      },
    );
  },
);
