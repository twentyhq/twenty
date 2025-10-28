import { type EachTestingContext } from 'twenty-shared/testing';

import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export const OBJECT_METADATA_NAMES_FAILING_TEST_CASES: EachTestingContext<
  Partial<Omit<CreateObjectInput, 'workspaceId' | 'dataSourceId'>>
>[] = [
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
