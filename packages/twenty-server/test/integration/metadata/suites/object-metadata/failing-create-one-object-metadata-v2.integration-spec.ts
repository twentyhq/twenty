import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-workspaces.util';

type CreateObjectInputPayload = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
>;

type CreateOneObjectMetadataItemTestingContext = EachTestingContext<
  Partial<CreateObjectInputPayload>
>[];
const failingNamesCreationTestsUseCase: CreateOneObjectMetadataItemTestingContext =
  [
    {
      title: 'when nameSingular has invalid characters',
      context: { nameSingular: 'μ' },
    },
    {
      title: 'when namePlural has invalid characters',
      context: { namePlural: 'μ' },
    },
    {
      title: 'when nameSingular is a reserved keyword',
      context: { nameSingular: 'user' },
    },
    {
      title: 'when namePlural is a reserved keyword',
      context: { namePlural: 'users' },
    },
    {
      title: 'when nameSingular is not camelCased',
      context: { nameSingular: 'Not_Camel_Case' },
    },
    {
      title: 'when namePlural is not camelCased',
      context: { namePlural: 'Not_Camel_Case' },
    },
    {
      title: 'when namePlural is an empty string',
      context: { namePlural: '' },
    },
    {
      title: 'when nameSingular is an empty string',
      context: { nameSingular: '' },
    },
    {
      title: 'when nameSingular contains only whitespaces',
      context: { nameSingular: '                 ' },
    },
    {
      title: 'when nameSingular contains only one char and whitespaces',
      context: { nameSingular: '     a        a    ' },
    },
    {
      title: 'when name exceeds maximum length',
      context: { nameSingular: 'a'.repeat(64) },
    },
    {
      title: 'when names are identical',
      context: {
        nameSingular: 'fooBar',
        namePlural: 'fooBar',
      },
    },
    {
      title: 'when names with whitespaces result to be identical',
      context: {
        nameSingular: '      fooBar               ',
        namePlural: 'fooBar',
      },
    },
  ];

const failingLabelsCreationTestsUseCase: CreateOneObjectMetadataItemTestingContext =
  [
    {
      title: 'when labelSingular is empty',
      context: { labelSingular: '' },
    },
    {
      title: 'when labelPlural is empty',
      context: { labelPlural: '' },
    },
    {
      title: 'when labelSingular exceeds maximum length',
      context: { labelSingular: 'A'.repeat(64) },
    },
    {
      title: 'when labelPlural exceeds maximum length',
      context: { labelPlural: 'A'.repeat(64) },
    },
    {
      title: 'when labelSingular contains only whitespace',
      context: { labelSingular: '   ' },
    },
    {
      title: 'when labelPlural contains only whitespace',
      context: { labelPlural: '   ' },
    },
    {
      title: 'when labels are identical',
      context: {
        labelPlural: 'fooBar',
        labelSingular: 'fooBar',
      },
    },
    {
      title: 'when labels with whitespaces result to be identical',
      context: {
        labelPlural: '      fooBar               ',
        labelSingular: 'fooBar',
      },
    },
  ];

const allTestsUseCases = [
  ...failingNamesCreationTestsUseCase,
  ...failingLabelsCreationTestsUseCase,
];

describe('Object metadata creation should fail v2', () => {
  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });

  afterAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      FeatureFlagKey.IS_WORKSPACE_MIGRATION_V2_ENABLED,
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });
  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneObjectMetadata({
        input: getMockCreateObjectInput(context),
        expectToFail: true,
      });

      expect(errors.length).toBe(1);
      expect(errors[0]).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny(errors[0]),
      );
    },
  );
});
