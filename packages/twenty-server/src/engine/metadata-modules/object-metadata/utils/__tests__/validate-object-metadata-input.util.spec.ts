import { getMockCreateObjectInput } from 'test/integration/metadata/suites/object-metadata/utils/generate-mock-create-object-metadata-input';
import { EachTestingContext } from 'twenty-shared/testing';

import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { validateObjectMetadataInputNamesOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';

type ValidateObjectNameTestingContext = EachTestingContext<
  Partial<UpdateObjectPayload>
>;
const validateObjectMetadataTestCases: ValidateObjectNameTestingContext[] = [
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
    title: 'when name exceeds maximum length',
    context: { nameSingular: 'a'.repeat(64) },
  },
];

describe('validateObjectMetadataInputOrThrow should fail', () => {
  it.each(validateObjectMetadataTestCases)('$title', ({ context }) => {
    expect(() =>
      validateObjectMetadataInputNamesOrThrow(
        getMockCreateObjectInput(context),
      ),
    ).toThrowErrorMatchingSnapshot();
  });
});
