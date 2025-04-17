import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

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

describe('Object metadata creation should fail', () => {
  it.each(allTestsUseCases)('$title', async ({ context }) => {
    const { errors } = await createOneObjectMetadata({
      input: getMockCreateObjectInput(context),
      expectToFail: true,
    });

    expect(errors.length).toBe(1);
    const firstError = errors[0];

    expect(firstError.extensions.code).toBe(ErrorCode.BAD_USER_INPUT);
    expect(firstError.message).toMatchSnapshot();
  });
});
